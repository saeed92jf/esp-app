import { getTranslations } from "next-intl/server";
import { SitemapClient } from "@/modules/sitemap/components/sitemap-client";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Common" });
  return { title: `Sitemap | ${t("appName.lead")}` };
}

export default function SitemapPage() {
  return (
    <main className="w-full min-h-[calc(100dvh-var(--header-height)-var(--footer-height,3.5rem))] bg-background">
      <SitemapClient />
    </main>
  );
}
