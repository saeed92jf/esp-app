"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Headphones, Mail, Copy, Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SupportSection({ className }: { className?: string }) {
  const t = useTranslations("Home.supportSection");
  const [copied, setCopied] = useState(false);

  const supportEmail = "support@esp-app.com";

  const handleCopyEmail = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(supportEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-xl mx-auto flex flex-col items-center justify-center px-4 select-none my-auto",
        className
      )}
    >
      {/* Sleek Minimalist Support Card */}
      <div className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card/85 dark:bg-[#0e1017]/85 backdrop-blur-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/10 dark:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7)] text-center flex flex-col items-center gap-4 sm:gap-5">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-40 bg-gradient-to-b from-primary/30 to-cyan-500/10" />

        {/* Minimalist Icon Badge */}
        <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
          <Headphones className="size-6" />
        </div>

        {/* Title & Short Clean Description */}
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Interactive Email Bar */}
        <div className="w-full max-w-md flex flex-col sm:flex-row items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-muted/50 dark:bg-muted/20 border border-border/60">
          <div className="flex items-center gap-2.5 px-3 py-1">
            <Mail className="size-4 text-primary shrink-0" />
            <span
              dir="ltr"
              className="font-mono text-xs sm:text-sm font-semibold text-foreground select-all tracking-tight"
            >
              {supportEmail}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyEmail}
              className={cn(
                "h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-all duration-200 cursor-pointer shadow-none border-0",
                copied
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "hover:bg-muted text-foreground"
              )}
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span>{t("copied")}</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>{t("copyEmail")}</span>
                </>
              )}
            </Button>

            <Button
              asChild
              size="sm"
              className="h-8 px-3.5 rounded-xl text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-none border-0"
            >
              <a href={`mailto:${supportEmail}`}>
                <Send className="size-3" />
                <span>{t("sendEmail")}</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Live Status / Response Time */}
        <div className="fa-num inline-flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t("responseTime")}</span>
        </div>
      </div>
    </div>
  );
}
