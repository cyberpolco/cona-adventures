// lib/bookings.server.js — SERVER ONLY.
import { prisma } from './prisma';
import { sendEmail } from './email.server';
import { bookingConfirmedHtml } from './emails/bookingConfirmed';

// Idempotent: calling it twice with the same ref/transactionId is safe.
// Sends a confirmation email only on the first successful transition (pending → paid).
export async function markBookingPaid({ conaRef, txRef, transactionId, amount, currency }) {
  if (!conaRef) return;
  try {
    const [bookingResult] = await prisma.$transaction([
      prisma.booking.updateMany({
        where: { ref: conaRef, status: { not: 'paid' } },
        data:  { status: 'paid', updatedAt: new Date() },
      }),
      prisma.payment.updateMany({
        where: { txRef },
        data:  { status: 'successful', transactionId: String(transactionId ?? ''), updatedAt: new Date() },
      }),
    ]);

    // bookingResult.count === 0 means already paid — skip email (idempotency).
    if (bookingResult.count === 0) return;

    // Fetch the full booking + lead traveler to populate the email.
    const booking = await prisma.booking.findUnique({
      where:   { ref: conaRef },
      include: { travelers: { take: 1 } },
    });
    if (!booking) return;

    const lead      = booking.travelers[0];
    const leadEmail = lead?.email;
    if (!leadEmail) return; // no email address on record — skip silently

    const experiences = (() => {
      try { return JSON.parse(booking.experiences || '[]'); }
      catch { return []; }
    })();

    await sendEmail({
      to:      leadEmail,
      subject: `✦ Booking Confirmed — ${conaRef} | CoNa Adventures`,
      html:    bookingConfirmedHtml({
        ref:          booking.ref,
        country:      booking.country,
        adults:       booking.adults,
        children:     booking.children,
        experiences,
        accommodation: booking.accommodation,
        payType:      booking.payType,
        priceTotal:   booking.priceTotal,
        priceCharged: booking.priceCharged,
        currency:     currency || 'USD',
        leadName:     [lead?.firstName, lead?.lastName].filter(Boolean).join(' '),
        leadEmail,
      }),
    });
  } catch (e) {
    console.error('markBookingPaid failed:', e.message);
  }
}
