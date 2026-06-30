// pages/api/bookings.js
// Admin/Ops read-only endpoint — lists all bookings for the dashboard.
// Guarded server-side by session role; never trust the client.
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';

const ALLOWED = ['Super Admin', 'Operations Manager'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !ALLOWED.includes(session.user?.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: { travelers: true, payments: true },
  });
  return res.status(200).json({ bookings });
}
