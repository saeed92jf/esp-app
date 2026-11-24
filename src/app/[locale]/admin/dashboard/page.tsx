import { getTranslations } from "next-intl/server";
import { AdminExecutiveDashboardWrapper } from "@/modules/admin/components/AdminExecutiveDashboardWrapper";

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
    title: `${t("title")} | داشبورد مدیریتی منابع انسانی`,
  };
}

export default function AdminDashboardPage() {
  return <AdminExecutiveDashboardWrapper />;
}
