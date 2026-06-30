// lib/bookings.server.js — SERVER ONLY.
import { prisma } from './prisma';

// Idempotent: calling it twice with the same ref/transactionId is safe.
export async function markBookingPaid({ conaRef, txRef, transactionId, amount, currency }) {
  if (!conaRef) return;
  try {
    await prisma.$transaction([
      prisma.booking.updateMany({
        where: { ref: conaRef, status: { not: 'paid' } },
        data:  { status: 'paid', updatedAt: new Date() },
      }),
      prisma.payment.updateMany({
        where: { txRef },
        data:  { status: 'successful', transactionId: String(transactionId ?? ''), updatedAt: new Date() },
      }),
    ]);
  } catch (e) {
    console.error('markBookingPaid failed:', e.message);
  }
}
