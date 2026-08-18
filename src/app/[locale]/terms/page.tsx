import { getTranslations } from "next-intl/server";

import { Scale, FileSignature, Lightbulb, AlertTriangle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Common" });
  return { title: `Terms of Use | ${t("appName.lead")}` };
}

export default async function TermsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const isFa = locale === "fa";
  const t = await getTranslations({ locale, namespace: "Terms" });

  const sections = [
    {
      id: "acceptance",
      icon: FileSignature,
      title: t("acceptance"),
      body: t("acceptanceBody"),
    },
    {
      id: "intellectualProperty",
      icon: Lightbulb,
      title: t("intellectualProperty"),
      body: t("intellectualPropertyBody"),
    },
    {
      id: "disclaimer",
      icon: AlertTriangle,
      title: t("disclaimer"),
      body: t("disclaimerBody"),
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[25%] -right-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[25%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <main className="container relative mx-auto px-6 py-20 md:py-32 max-w-4xl z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-primary/10 text-primary mb-2 ring-1 ring-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.1)]">
            <Scale className="size-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm md:text-base font-medium px-4 py-1.5 rounded-full bg-muted text-muted-foreground border border-border/50">
            {t("subtitle")}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <section 
                key={section.id} 
                className="group relative flex flex-col md:flex-row gap-6 p-8 rounded-3xl bg-card border border-border/40 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
              >
                <div className="shrink-0">
                  <div className="flex items-center justify-center size-12 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-transform duration-300">
                    <Icon className="size-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground/90 leading-relaxed font-light">
                    {section.body}
                  </p>
                </div>
              </section>
            );
          })}
        </div>
        
        {/* Footer Actions */}
        <div className="mt-16 text-center">
          <Button asChild variant="outline" className="rounded-full px-8 h-12 text-base">
            <Link href="/">{isFa ? "بازگشت به صفحه اصلی" : "Back to Home"}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
