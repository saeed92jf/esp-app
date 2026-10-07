"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocale } from "next-intl";

export default function PlansPage() {
  const t = useTranslations("Plans");
  const locale = useLocale();
  const isRtl = locale === "fa";

  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start">
      <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center">

        {/* Page Header */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mb-8">
          {t("subtitle")}
        </p>

        {/* Highlighted Testing Notice Banner */}
        <div className="w-full p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 mb-10 flex items-start sm:items-center gap-3.5 text-start shadow-sm">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldCheck className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm sm:text-base text-amber-700 dark:text-amber-300">
              {t("currentPlan")}: {t("activeStatus")}
            </span>
            <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
              {t("testingNotice")}
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-start mb-10">
          {/* Pro Tier (Active) */}
          <div className="relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-card border-2 border-primary/60 shadow-xl">
            <div className="absolute -top-3.5 end-6 px-3.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shadow-md z-10">
              {t("activeStatus")}
            </div>

            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                <ShieldCheck className="size-5" />
                <span>{t("proTitle")}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
                {t("proDesc")}
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-foreground/90">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{t("proFeature1")}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{t("proFeature2")}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{t("proFeature3")}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{t("proFeature4")}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-border/40">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {t("proActivatedNote")}
              </span>
            </div>
          </div>

          {/* Public Tier */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-muted/40 border border-border/40 shadow-sm opacity-80">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-2 text-foreground/80">
                <span>{t("freeTitle")}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
                {t("freeDesc")}
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-slate-400 shrink-0" />
                  <span>{t("freeFeature1")}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-slate-400 shrink-0" />
                  <span>{t("freeFeature2")}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-border/40">
              <span className="text-xs text-muted-foreground">
                {t("freeFooterNote")}
              </span>
            </div>
          </div>
        </div>

        {/* Back Link below Plans */}
        <div className="w-full flex justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full bg-muted/60 border border-border/40 hover:bg-muted/90"
          >
            {isRtl ? <ArrowRight className="size-3.5" /> : <ArrowLeft className="size-3.5" />}
            <span>{t("backHome")}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
