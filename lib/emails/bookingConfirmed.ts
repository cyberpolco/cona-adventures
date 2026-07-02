// lib/emails/bookingConfirmed.ts
// Returns an HTML string for the booking confirmation email.
// Keep inline styles — email clients strip <style> blocks.

const GOLD   = '#E5A23C';
const TEAL   = '#2C7A70';
const TERRA  = '#C0532F';
const BG     = '#0e1a12';
const CARD   = '#152010';
const MUTED  = '#8a9a8a';
const WHITE  = '#f0f0e8';

function flag(country: string | null | undefined): string {
  return country?.toLowerCase().includes('namibia') ? '🏜' : '🌿';
}

function formatCountry(country: string | null | undefined): string {
  if (!country) return 'Your destination';
  return country.toLowerCase() === 'namibia'
    ? 'Namibia'
    : country.toLowerCase() === 'congo'
    ? 'DR Congo'
    : country.toLowerCase() === 'both'
    ? 'DR Congo & Namibia'
    : country;
}

export interface BookingEmailData {
  ref: string;
  country: string;
  adults: number;
  children: number;
  experiences: string[];
  accommodation: string | null;
  payType: string;
  priceTotal: number;
  priceCharged: number;
  currency: string;
  leadName: string;
  leadEmail: string;
}

export function bookingConfirmedHtml(booking: BookingEmailData): string {
  const {
    ref, country, adults, children,
    experiences = [], accommodation,
    payType, priceTotal, priceCharged,
    currency = 'USD',
    leadName, leadEmail,
  } = booking;

  const isDeposit  = payType === 'deposit';
  const paidLabel  = isDeposit ? 'Deposit paid' : 'Amount paid';
  const paidAmt    = `${currency} ${Number(priceCharged).toLocaleString()}`;
  const totalAmt   = `${currency} ${Number(priceTotal).toLocaleString()}`;
  const remaining  = isDeposit ? `${currency} ${(priceTotal - priceCharged).toLocaleString()}` : null;
  const dest       = formatCountry(country);
  const icon       = flag(country);
  const partyLine  = [
    `${adults} adult${adults !== 1 ? 's' : ''}`,
    children > 0 ? `${children} child${children !== 1 ? 'ren' : ''}` : '',
  ].filter(Boolean).join(', ');

  const expList = Array.isArray(experiences) && experiences.length
    ? experiences.map(e => `<li style="margin:4px 0;color:${WHITE}">${e}</li>`).join('')
    : `<li style="color:${MUTED}">To be confirmed with your guide</li>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Booking Confirmed — CoNa Adventures</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="padding-bottom:24px;text-align:center;">
          <div style="display:inline-block;">
            <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:${GOLD};letter-spacing:0.15em;">CONA</span>
            <span style="font-family:Georgia,serif;font-size:11px;color:${GOLD};letter-spacing:0.25em;display:block;margin-top:-4px;">ADVENTURES</span>
          </div>
        </td></tr>

        <!-- Hero band -->
        <tr><td style="background:${TEAL};border-radius:8px 8px 0 0;padding:28px 32px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">${icon}</div>
          <h1 style="margin:0;color:#fff;font-family:Georgia,serif;font-size:22px;font-weight:700;letter-spacing:0.05em;">
            Your Adventure is Confirmed
          </h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
            Booking reference: <strong style="color:${GOLD};letter-spacing:0.1em;">${ref}</strong>
          </p>
        </td></tr>

        <!-- Body card -->
        <tr><td style="background:${CARD};border-radius:0 0 8px 8px;padding:28px 32px;">

          <p style="margin:0 0 20px;color:${WHITE};font-size:15px;line-height:1.6;">
            Hi ${leadName || 'Traveller'},
          </p>
          <p style="margin:0 0 24px;color:${WHITE};font-size:15px;line-height:1.6;">
            Thank you for booking with CoNa Adventures. Your payment has been received and
            your expedition to <strong style="color:${GOLD};">${dest}</strong> is locked in.
            Our team will be in touch within <strong>48 hours</strong> with your full itinerary,
            pre-departure checklist and guide introduction.
          </p>

          <!-- Booking details table -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#0e1a12;border-radius:6px;padding:20px;margin-bottom:24px;">
            <tr>
              <td style="padding:6px 0;color:${MUTED};font-size:13px;width:45%;">Destination</td>
              <td style="padding:6px 0;color:${WHITE};font-size:13px;font-weight:600;">${icon} ${dest}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:${MUTED};font-size:13px;">Party</td>
              <td style="padding:6px 0;color:${WHITE};font-size:13px;">${partyLine}</td>
            </tr>
            ${accommodation ? `
            <tr>
              <td style="padding:6px 0;color:${MUTED};font-size:13px;">Accommodation</td>
              <td style="padding:6px 0;color:${WHITE};font-size:13px;">${accommodation}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:6px 0;color:${MUTED};font-size:13px;">${paidLabel}</td>
              <td style="padding:6px 0;color:${GOLD};font-size:13px;font-weight:700;">${paidAmt}</td>
            </tr>
            ${isDeposit ? `
            <tr>
              <td style="padding:6px 0;color:${MUTED};font-size:13px;">Total trip cost</td>
              <td style="padding:6px 0;color:${WHITE};font-size:13px;">${totalAmt}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:${MUTED};font-size:13px;">Balance due</td>
              <td style="padding:6px 0;color:${TERRA};font-size:13px;font-weight:600;">${remaining}</td>
            </tr>` : ''}
          </table>

          <!-- Experiences -->
          <p style="margin:0 0 8px;color:${MUTED};font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">
            Selected experiences
          </p>
          <ul style="margin:0 0 28px;padding-left:20px;font-size:14px;line-height:1.8;">
            ${expList}
          </ul>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="https://conaadventures.com"
              style="display:inline-block;background:${GOLD};color:#0e1a12;font-family:Georgia,serif;
                     font-weight:700;font-size:13px;letter-spacing:0.1em;text-decoration:none;
                     padding:13px 32px;border-radius:4px;">
              ✦ VISIT CONA ADVENTURES
            </a>
          </div>

          <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.7;text-align:center;">
            Questions? Reply to this email or write to
            <a href="mailto:info@conaadventures.com"
              style="color:${TEAL};text-decoration:none;">info@conaadventures.com</a>
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0 0;text-align:center;">
          <p style="margin:0;color:${MUTED};font-size:11px;line-height:1.8;">
            CoNa Adventures · From the Congo to the Namib<br/>
            This email was sent to ${leadEmail}.<br/>
            © 2026 CoNa Adventures. All rights reserved.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
