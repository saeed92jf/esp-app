import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Common" });
  return { title: `Privacy Policy | ${t("appName.lead")}` };
}

export default async function PrivacyPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const isFa = locale === "fa";

  return (
    <main className="container mx-auto px-6 py-24 md:py-32 max-w-4xl min-h-screen">
      <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          {isFa ? "حریم خصوصی" : "Privacy Policy"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isFa 
            ? "آخرین بروزرسانی: آگوست ۲۰۲۶" 
            : "Last Updated: August 2026"}
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            {isFa ? "۱. جمع‌آوری داده‌ها" : "1. Data Collection"}
          </h2>
          <p className="text-muted-foreground/80 leading-relaxed">
            {isFa 
              ? "پلتفرم ما (یورواسلات پارس) به حریم خصوصی کاربران احترام گذاشته و تنها داده‌هایی را جمع‌آوری می‌کند که برای بهبود عملکرد سامانه محاسباتی و مهندسی ضروری است. این اطلاعات ممکن است شامل تنظیمات تم، زبان انتخابی و تاریخچه پروژه‌ها باشد."
              : "Our platform (Euroslot Pars) respects user privacy and only collects data necessary to improve the functionality of our engineering and calculation systems. This may include theme preferences, language settings, and project history."}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            {isFa ? "۲. استفاده از کوکی‌ها" : "2. Use of Cookies"}
          </h2>
          <p className="text-muted-foreground/80 leading-relaxed">
            {isFa
              ? "ما از کوکی‌ها (Cookies) برای ذخیره‌سازی تنظیمات ظاهری (مانند رنگ اصلی و تم تاریک/روشن) و حفظ وضعیت ورود شما استفاده می‌کنیم تا تجربه‌ای یکپارچه ارائه دهیم. هیچ یک از داده‌های شخصی حساس از این طریق استخراج نمی‌شود."
              : "We use cookies to store visual preferences (such as the primary theme color and light/dark mode) and maintain your login state to provide a seamless experience. No sensitive personal data is extracted through this method."}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            {isFa ? "۳. حقوق شما" : "3. Your Rights"}
          </h2>
          <p className="text-muted-foreground/80 leading-relaxed">
            {isFa
              ? "شما حق دارید هر زمان که مایل بودید داده‌های خود را مشاهده، ویرایش یا حذف کنید. برای هرگونه سوال یا درخواست مرتبط با حریم خصوصی، می‌توانید با تیم پشتیبانی تحقیق و توسعه (R&D) ما تماس بگیرید."
              : "You have the right to view, modify, or delete your data at any time. For any privacy-related questions or requests, you can contact our R&D support team."}
          </p>
        </section>
      </div>
    </main>
  );
}
