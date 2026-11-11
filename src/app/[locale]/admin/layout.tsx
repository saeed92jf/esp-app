import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AuthGate } from "@/modules/auth/components/auth-gate";
import { AdminProvider, AdminLayout } from "@/modules/admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "Admin",
  });
  return {
    title: t("title"),
  };
}

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGate
      allowedRoles={["superadmin", "admin", "dept_admin", "office_admin"]}
    >
      <AdminProvider>
        <AdminLayout>{children}</AdminLayout>
      </AdminProvider>
    </AuthGate>
  );
}
