// lib/auth.ts
// Shared role constants + a server-side route guard for getServerSideProps.
import type { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from './authOptions';

export const ROLES = {
  ADMIN:   'Super Admin',
  OPS:     'Operations Manager',
  GUIDE:   'Tour Guide',
  DRIVER:  'Driver',
  PARTNER: 'Hotel Partner',
  CLIENT:  'Client',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

type RequireRoleResult =
  | { redirect: { destination: string; permanent: boolean }; props?: never }
  | { props: { session: Session }; redirect?: never };

// Use inside getServerSideProps to enforce access server-side (deny by default).
export async function requireRole(ctx: GetServerSidePropsContext, allowed: Role[]): Promise<RequireRoleResult> {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || !allowed.includes(session.user?.role as Role)) {
    return { redirect: { destination: '/?auth=required', permanent: false } };
  }
  return { props: { session } };
}
