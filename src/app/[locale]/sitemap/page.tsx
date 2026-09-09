import { getTranslations } from "next-intl/server";
import { SitemapClient } from "@/modules/sitemap/components/sitemap-client";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Common" });
  return { title: `Sitemap | ${t("appName.lead")}` };
}

export default function SitemapPage() {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[64px] z-10 bg-background">
      <SitemapClient />
    </div>
  );
}
