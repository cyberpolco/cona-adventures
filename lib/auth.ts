// lib/auth.ts — SERVER ONLY. Never import from a client component; import
// lib/roles.ts instead for just the ROLES constants (no next-auth/Prisma deps).
import type { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from './authOptions';
import { ROLES, type Role } from './roles';

export { ROLES, type Role };

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
