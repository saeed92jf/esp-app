import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FileText, Shield, Users } from "lucide-react";
import { NAVIGATION } from "@/config/navigation";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Common" });
  return { title: `Sitemap | ${t("appName.lead")}` };
}

export default function SitemapPage() {
  const tNav = useTranslations("Menu");
  const tCommon = useTranslations("Common");

  return (
    <main className="container mx-auto px-6 py-24 md:py-32 max-w-5xl min-h-screen">
      <div className="mb-8 border-b border-border/50 pb-5">
        <h1 className="text-xl md:text-2xl font-bold mb-2 text-foreground flex items-center gap-2.5">
          <FileText className="size-5 text-primary" />
          {tCommon("appName.lead")} Sitemap
        </h1>
        <p className="text-muted-foreground text-sm">
          A complete hierarchical overview of all modules and pages available in the application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {NAVIGATION.map((group) => {
          const Icon = group.icon;
          return (
            <div 
              key={group.id} 
              className="p-5 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
                <div className="p-1 rounded-md bg-primary/10 text-primary">
                  {Icon && <Icon className="size-3.5" />}
                </div>
                <h2 className="text-foreground font-medium text-sm">{tNav(`sections.${group.labelKey}`)}</h2>
              </div>
              
              <ul className="space-y-4">
                {group.items.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <li key={idx} className="relative pl-4">
                      {/* Tree branch line */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-border" />
                      <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-border" />
                      
                      <Link 
                        href={item.href as any} 
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
                      >
                        {ItemIcon && <ItemIcon className="size-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />}
                        <span className="font-medium text-[13px]">
                          {/* Fallback to raw labelKey if translation is missing (e.g. for ESP-Flow if not defined in Nav) */}
                          {tNav.has(`items.${item.labelKey}`) ? tNav(`items.${item.labelKey}`) : item.labelKey}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {/* Static Extra Group (Legal & Team) */}
        <div className="p-5 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-all shadow-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
            <div className="p-1 rounded-md bg-primary/10 text-primary">
              <Shield className="size-3.5" />
            </div>
            <h2 className="text-foreground font-medium text-sm">Information</h2>
          </div>
          <ul className="space-y-4">
            <li className="relative pl-4">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-border" />
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-border" />
              <Link href="/team" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                <Users className="size-3.5 opacity-70 group-hover:opacity-100" />
                <span className="font-medium text-[13px]">R&D Team</span>
              </Link>
            </li>
            <li className="relative pl-4">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-border" />
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-border" />
              <Link href="/privacy" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                <Shield className="size-3.5 opacity-70 group-hover:opacity-100" />
                <span className="font-medium text-[13px]">Privacy Policy</span>
              </Link>
            </li>
            <li className="relative pl-4">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-border" />
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-border" />
              <Link href="/terms" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                <FileText className="size-3.5 opacity-70 group-hover:opacity-100" />
                <span className="font-medium text-[13px]">Terms of Use</span>
              </Link>
            </li>
          </ul>
        </div>

      </div>
    </main>
  );
}
