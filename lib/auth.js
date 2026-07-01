// lib/auth.js
// Shared role constants + a server-side route guard for getServerSideProps.
import { getServerSession } from 'next-auth/next';
import { authOptions } from './authOptions';

export const ROLES = {
  ADMIN:   'Super Admin',
  OPS:     'Operations Manager',
  GUIDE:   'Tour Guide',
  DRIVER:  'Driver',
  PARTNER: 'Hotel Partner',
  CLIENT:  'Client',
};

// Use inside getServerSideProps to enforce access server-side (deny by default).
export async function requireRole(ctx, allowed) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || !allowed.includes(session.user?.role)) {
    return { redirect: { destination: '/?auth=required', permanent: false } };
  }
  return { props: { session } };
}
