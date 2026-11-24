import { getTranslations } from "next-intl/server";
import { AdminOrgChartSection } from "@/modules/admin";

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
    title: `${t("title")} | ${t("orgChart")}`,
  };
}

export default function AdminOrgChartPage() {
  return <AdminOrgChartSection />;
}
