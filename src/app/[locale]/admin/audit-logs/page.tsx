import { getTranslations } from "next-intl/server";
import { AuthGate } from "@/modules/auth/components/auth-gate";
import { AdminAuditLogsSection } from "@/modules/admin";

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
    title: `${t("title")} | ${t("auditLogs")}`,
  };
}

export default function AdminAuditLogsPage() {
  return (
    <AuthGate allowedRoles={["superadmin"]}>
      <AdminAuditLogsSection />
    </AuthGate>
  );
}
