import { getTranslations } from 'next-intl/server';
import { AdminDashboard } from '@/modules/admin/components/AdminDashboard';
import { AuthGate } from '@/modules/auth/components/auth-gate';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'Admin' });
  return {
    title: t('title'),
  };
}

export default function AdminPage() {
  return (
    <AuthGate allowedRoles={['superadmin', 'admin', 'dept_admin', 'office_admin']}>
      <AdminDashboard />
    </AuthGate>
  );
}
