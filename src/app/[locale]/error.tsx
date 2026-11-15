// src/app/[locale]/error.tsx
"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { RotateCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: ErrorProps) {
  const locale = useLocale();
  const isFa = locale === "fa";
  const router = useRouter();

  useEffect(() => {
    // Log the error to console for diagnostic tracing
    console.error("[LocaleError Boundary caught error]:", error);
  }, [error]);

  return (
    <div
      className="w-full flex-1 min-h-[var(--home-height)] flex items-center justify-center p-4 sm:p-6 bg-transparent select-none"
      dir={isFa ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md bg-card/90 dark:bg-card/80 border border-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center relative overflow-hidden animate-in fade-in duration-200">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute -top-16 start-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-25 bg-gradient-to-b from-destructive/30 to-amber-500/10" />

        {/* Brand Icon */}
        <div className="mb-4">
          <Logo className="text-sm sm:text-base" showText={false} />
        </div>

        {/* Warning Icon Badge */}
        <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mb-3.5 shadow-xs">
          <AlertTriangle className="size-7" />
        </div>

        {/* Bilingual Header */}
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          {isFa ? "خطا در بارگذاری صفحه" : "Page Loading Error"}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
          {isFa
            ? "متأسفانه در بارگذاری داده‌های این بخش اختلالی رخ داده است. می‌توانید مجدداً تلاش کنید یا به صفحه اصلی بازگردید."
            : "An unexpected error occurred while loading this page. You can try again or return to the home page."}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full mt-6">
          <Button
            type="button"
            variant="default"
            onClick={() => reset()}
            className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold gap-2 cursor-pointer shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <RotateCw className="size-4" />
            <span>{isFa ? "تلاش مجدد" : "Try Again"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold gap-2 border-border/70 hover:bg-muted text-foreground cursor-pointer transition-all"
          >
            <Home className="size-4" />
            <span>{isFa ? "صفحه اصلی" : "Home Page"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
