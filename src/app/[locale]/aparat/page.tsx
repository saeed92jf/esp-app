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
  // خواندن نام کانال‌ها از فایل .env.local
  const envUsernames = process.env.NEXT_PUBLIC_APARAT_USERNAMES || "";
  const usernames = envUsernames
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* پاس دادن نام کانال‌ها به کلاینت برای واکشی اطلاعات از طریق سرویس شما */}
      <AparatClient usernames={usernames} />
    </div>
  );
}
