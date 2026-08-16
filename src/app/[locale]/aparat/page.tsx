import { getTranslations } from "next-intl/server";
import { AparatClient } from "./aparat-client"; // مسیر ایمپورت را چک کنید

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Menu.items" });
  return { title: t("videos") };
}

export default function AparatPage() {
  // خواندن نام کانال از فایل .env.local
  const channelName = (process.env.NEXT_PUBLIC_APARAT_USERNAMES || process.env.NEXT_PUBLIC_APARAT_CHANNEL || "zoomit").split(",")[0].trim();

  return (
    <div className="min-h-screen pt-20">
      {/* پاس دادن نام کانال به کلاینت */}
      <AparatClient username={channelName} />
    </div>
  );
}
