// pages/api/bookings.ts
// Admin/Ops read-only endpoint — lists all bookings for the dashboard.
// Guarded server-side by session role; never trust the client.
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';
import { redactTraveler } from '../../lib/pii.server';
import { ROLES, type Role } from '../../lib/auth';

const ALLOWED: Role[] = [ROLES.ADMIN, ROLES.OPS];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || !ALLOWED.includes(session.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const role = session.user.role;

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: { travelers: true, payments: true },
  });

  const redacted = bookings.map((b) => ({
    ...b,
    travelers: b.travelers.map((t) => redactTraveler(t, role)),
  }));

  return res.status(200).json({ bookings: redacted });
}
