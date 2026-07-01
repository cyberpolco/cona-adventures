// pages/api/checkout.js
// Server-side checkout. The browser sends trip selections only. We recompute
// the amount here, then ask Flutterwave for a hosted-checkout link (card data
// entered on Flutterwave's page — PCI SAQ A).
// When Flutterwave keys are absent we fall back to mock mode for local dev.
import { estimatePrice, depositOf } from '../../lib/pricing';
import { flwConfigured, initPayment } from '../../lib/flutterwave.server';
import { prisma } from '../../lib/prisma';
import { CONSENT_VERSION, isMinorAtTravel, computeRetainUntil } from '../../lib/pii.server';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tripData, payType } = req.body || {};
  if (!tripData) return res.status(400).json({ error: 'Missing trip details' });

  // Require explicit consent before persisting any personal data.
  if (!tripData.consent) {
    return res.status(400).json({ error: 'Consent to personal data collection is required' });
  }

  const price  = estimatePrice(tripData);
  const dueNow = payType === 'deposit' ? depositOf(price) : price;
  if (!price || price <= 0) return res.status(400).json({ error: 'Invalid trip selection' });

  const ref      = 'CNA-' + Math.floor(8000 + Math.random() * 1999);
  const tx_ref   = `${ref}-${Date.now()}`;
  const currency = process.env.PAYMENT_CURRENCY || 'USD';

  const travelers  = tripData?.travelers || [];
  const travelStr  = tripData.arrival   || null;
  const depStr     = tripData.departure || null;
  const consentAt  = new Date();

  // Retention: 1 year after travel date (or from now if no date given).
  const retentionBase = travelStr ? new Date(travelStr) : consentAt;
  const dataRetentionExpiry = new Date(retentionBase.getTime() + 365 * 24 * 60 * 60 * 1000);

  // Persist a pending booking with all travelers.
  try {
    await prisma.booking.upsert({
      where: { ref },
      update: {},
      create: {
        ref,
        country:             tripData.country || '',
        adults:              Number(tripData.adults)   || 1,
        children:            Number(tripData.children) || 0,
        experiences:         JSON.stringify(tripData.experiences || []),
        accommodation:       tripData.accommodation || null,
        payType:             payType || 'full',
        priceTotal:          price,
        priceCharged:        dueNow,
        status:              'pending',
        travelDate:          travelStr ? new Date(travelStr) : null,
        departureDate:       depStr    ? new Date(depStr)    : null,
        dataRetentionExpiry,
        travelers: {
          create: travelers
            .filter((t) => t.firstName && t.lastName)
            .map((t) => {
              const minor  = isMinorAtTravel(t.dob, travelStr);
              const retain = computeRetainUntil(travelStr, minor);
              return {
                firstName:        t.firstName   || '',
                middleName:       t.middleName   || null,
                lastName:         t.lastName    || '',
                email:            t.email       || null,
                phone:            t.phone       || null,
                dob:              t.dob         || null,
                nationality:      t.nationality || null,
                isMinor:          minor,
                consentGiven:     true,
                consentTimestamp: consentAt,
                consentVersion:   CONSENT_VERSION,
                retainUntil:      retain,
              };
            }),
        },
        payments: {
          create: {
            txRef:    tx_ref,
            amount:   dueNow,
            currency,
            status:   'pending',
            gateway:  'flutterwave',
          },
        },
      },
    });
    console.log(`[checkout] ref=${ref} travelers=${travelers.length} consent=${CONSENT_VERSION}`);
  } catch (e) {
    console.error('Booking persist failed:', e.message);
  }

  // Dev fallback — no gateway keys → keep mock flow, no card data.
  if (!flwConfigured()) {
    return res.status(200).json({ ok: true, mock: true, ref, price, dueNow });
  }

  const lead    = travelers[0] || {};
  const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.host}`;

  try {
    const url = await initPayment({
      tx_ref,
      amount: dueNow,
      currency,
      redirect_url: `${baseUrl}/payment/callback`,
      customer: {
        email:       lead.email || 'guest@conaadventures.com',
        name:        [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'CoNa Traveller',
        phonenumber: lead.phone || '',
      },
      meta: {
        cona_ref:    ref,
        destination: tripData.country || '',
        leadName:    [lead.firstName, lead.lastName].filter(Boolean).join(' '),
        selections:  JSON.stringify({
          country:       tripData.country,
          adults:        tripData.adults,
          children:      tripData.children,
          experiences:   tripData.experiences,
          accommodation: tripData.accommodation,
          payType:       payType || 'full',
        }),
      },
    });
    return res.status(200).json({ ok: true, url, tx_ref, ref });
  } catch (e) {
    return res.status(502).json({ error: 'Could not start payment. Please try again.' });
  }
}
