// pages/dashboard.js
// Guarded route — all staff roles can enter; each sees a role-appropriate view.
import Head from 'next/head';
import DashboardPage from '../components/pages/DashboardPage';
import { requireRole, ROLES } from '../lib/auth';

export default function Dashboard() {
  return (
    <>
      <Head><title>CoNa Adventures — Dashboard</title></Head>
      <DashboardPage />
    </>
  );
}

export async function getServerSideProps(ctx) {
  ctx.res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  const gate = await requireRole(ctx, [ROLES.ADMIN, ROLES.OPS, ROLES.GUIDE, ROLES.DRIVER]);
  if (gate.redirect) return { redirect: gate.redirect };
  return { props: {} };
}
