import { getTranslations } from "next-intl/server";
import { SitemapClient } from "@/modules/sitemap/components/sitemap-client";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Common" });
  return { title: `Sitemap | ${t("appName.lead")}` };
}

export default function SitemapPage() {
  return (
    <div className="w-full flex-1 flex flex-col min-h-full bg-background">
      <SitemapClient />
    </div>
  );
}
