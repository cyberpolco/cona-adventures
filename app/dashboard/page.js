import { getServerSession } from 'next-auth/next';
import { redirect }         from 'next/navigation';
import { authOptions }      from '../../lib/authOptions';
import DashboardPage        from '../../components/pages/DashboardPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title:  'Dashboard',
  robots: { index: false, follow: false },
};

const ALLOWED_ROLES = ['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver'];

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !ALLOWED_ROLES.includes(session.user?.role)) {
    redirect('/?auth=required');
  }

  return <DashboardPage />;
}
