// pages/api/checkout.js
// Server-side checkout. The browser sends trip SELECTIONS only. We recompute the
// amount here, then ask Flutterwave for a hosted-checkout link (card data is
// entered on Flutterwave's page — PCI SAQ A). If no FLW keys are configured we
// fall back to the previous mock so local dev still works.
import { estimatePrice, depositOf } from '../../lib/pricing';
import { flwConfigured, initPayment } from '../../lib/flutterwave.server';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tripData, payType } = req.body || {};
  if (!tripData) return res.status(400).json({ error: 'Missing trip details' });

  const price  = estimatePrice(tripData);
  const dueNow = payType === 'deposit' ? depositOf(price) : price;
  if (!price || price <= 0) return res.status(400).json({ error: 'Invalid trip selection' });

  const ref      = 'CNA-' + Math.floor(8000 + Math.random() * 1999);
  const tx_ref   = `${ref}-${Date.now()}`;
  const currency = process.env.PAYMENT_CURRENCY || 'USD';

  // Dev fallback — no gateway keys yet → keep the mock flow working, no card data.
  if (!flwConfigured()) {
    return res.status(200).json({ ok: true, mock: true, ref, price, dueNow });
  }

  const lead    = tripData?.travelers?.[0] || {};
  const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.host}`;

  try {
    const url = await initPayment({
      tx_ref,
      amount: dueNow,
      currency,
      redirect_url: `${baseUrl}/payment/callback`,
      customer: {
        email: lead.email || 'guest@conaadventures.com',
        name: [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'CoNa Traveller',
        phonenumber: lead.phone || '',
      },
      meta: {
        cona_ref: ref,
        destination: tripData.country || '',
        leadName: [lead.firstName, lead.lastName].filter(Boolean).join(' '),
        // Selections so the SERVER can re-verify the amount on return (never the client's number).
        selections: JSON.stringify({
          country: tripData.country,
          adults: tripData.adults,
          children: tripData.children,
          experiences: tripData.experiences,
          accommodation: tripData.accommodation,
          payType: payType || 'full',
        }),
      },
    });
    return res.status(200).json({ ok: true, url, tx_ref, ref });
  } catch (e) {
    return res.status(502).json({ error: 'Could not start payment. Please try again.' });
  }
}
