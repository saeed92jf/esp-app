import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Common" });
  return { title: `Terms of Use | ${t("appName.lead")}` };
}

export default async function TermsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const isFa = locale === "fa";
  const t = useTranslations("Terms");

  return (
    <main className="container mx-auto px-6 py-24 md:py-32 max-w-4xl min-h-screen">
      <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isFa 
            ? "لطفاً پیش از استفاده از سامانه، این موارد را با دقت مطالعه کنید." 
            : "Please read these terms carefully before using the platform."}
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            {t("acceptance")}
          </h2>
          <p className="text-muted-foreground/80 leading-relaxed">
            {isFa 
              ? "ورود و استفاده شما از پلتفرم مهندسی و محاسباتی یورواسلات پارس به معنای پذیرش کامل تمامی شرایط و قوانین مندرج در این صفحه است. در صورت عدم توافق با این قوانین، مجاز به استفاده از خدمات سامانه نخواهید بود."
              : "By accessing and using the Euroslot Pars engineering and calculation platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, you are not authorized to use the services."}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            {t("intellectualProperty")}
          </h2>
          <p className="text-muted-foreground/80 leading-relaxed">
            {isFa
              ? "تمامی حقوق مادی و معنوی، طراحی‌ها، کدهای اختصاصی ماژول‌ها و ابزارهای تحلیلیِ این سامانه متعلق به شرکت یورواسلات پارس می‌باشد. هرگونه کپی‌برداری یا استفاده تجاری بدون کسب اجازه کتبی، پیگرد قانونی به همراه خواهد داشت."
              : "All intellectual property rights, designs, proprietary module code, and analytical tools within this platform belong to Euroslot Pars. Any unauthorized copying or commercial use without written permission will result in legal action."}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            {t("disclaimer")}
          </h2>
          <p className="text-muted-foreground/80 leading-relaxed">
            {isFa
              ? "با وجود آنکه تیم تحقیق و توسعه (R&D) ما تمام تلاش خود را برای دقت ۱۰۰٪ در محاسبات مهندسی به کار گرفته است، نتایج ارائه‌شده صرفاً جهت راهنمایی است و مسئولیت نهایی تایید نقشه‌ها و محاسبات در پروژه‌های واقعی بر عهده مهندس ناظر پروژه می‌باشد."
              : "Although our R&D team has made every effort to ensure 100% accuracy in engineering calculations, the results provided are for guidance only. The ultimate responsibility for approving drawings and calculations in real-world projects lies with the supervising engineer."}
          </p>
        </section>
      </div>
    </main>
  );
}
