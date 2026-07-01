import { getServerSession } from 'next-auth/next';
import { redirect }         from 'next/navigation';
import { authOptions }      from '../../lib/authOptions';
import DashboardPage        from '../../components/pages/DashboardPage';

// Never cache the dashboard — it shows live session + booking data.
export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = ['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver'];

export const metadata = { title: 'Dashboard — CoNa Adventures' };

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !ALLOWED_ROLES.includes(session.user?.role)) {
    redirect('/?auth=required');
  }

  return <DashboardPage />;
}
