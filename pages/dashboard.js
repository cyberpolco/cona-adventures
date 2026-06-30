// pages/dashboard.js
// The operations dashboard is now a REAL route, gated on the server.
// Reaching /dashboard without an admin/ops session redirects to home — the
// UI is no longer the access control; the server is.
import Head from 'next/head';
import DashboardPage from '../components/pages/DashboardPage';
import { requireRole, ROLES } from '../lib/auth';

export default function Dashboard() {
  return (
    <>
      <Head><title>CoNa Adventures — Operations</title></Head>
      <DashboardPage />
    </>
  );
}

export async function getServerSideProps(ctx) {
  const gate = await requireRole(ctx, [ROLES.ADMIN, ROLES.OPS]);
  if (gate.redirect) return { redirect: gate.redirect };
  return { props: {} };
}
