"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { WifiOff, RotateCw, ServerOff, AlertTriangle, ShieldAlert, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface ServerConnectionErrorInfo {
  code?: string;
  message?: string;
  status?: number;
  timestamp?: Date | string;
  endpoint?: string;
}

export interface ServerConnectionErrorProps {
  error?: ServerConnectionErrorInfo | string | null;
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
  onSwitchToMock?: () => void;
  targetUrl?: string;
  variant?: "full" | "banner" | "card";
  className?: string;
  onDismiss?: () => void;
}

export function ServerConnectionError({
  error,
  onRetry,
  isRetrying = false,
  onSwitchToMock,
  targetUrl = "http://192.168.0.171:8080/api/v1",
  variant = "full",
  className,
  onDismiss,
}: ServerConnectionErrorProps) {
  const t = useTranslations("ServerConnection");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const errorObj: ServerConnectionErrorInfo = typeof error === "string" 
    ? { message: error } 
    : (error || {});

  const displayMessage = errorObj.message || t("noResponseDesc");
  const displayCode = errorObj.code || (errorObj.status === 0 ? "NETWORK_ERROR" : "NO_RESPONSE");
  const displayStatus = errorObj.status !== undefined 
    ? (errorObj.status === 0 ? (isRtl ? "عدم پاسخ (Timeout / Network Down)" : "0 (No Response / Timeout)") : errorObj.status)
    : (isRtl ? "پاسخی دریافت نشد" : "No Response");

  const formattedTime = React.useMemo(() => {
    const d = errorObj.timestamp ? new Date(errorObj.timestamp) : new Date();
    try {
      return d.toLocaleTimeString(isRtl ? "fa-IR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "";
    }
  }, [errorObj.timestamp, isRtl]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. BANNER VARIANT (نوار هشدار خطای بالای صفحه)
  // ─────────────────────────────────────────────────────────────────────────────
  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 p-3.5 sm:p-4 text-foreground shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none",
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <WifiOff className="size-4.5" />
          </div>
          <div className="flex flex-col min-w-0 text-start">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-300">
                {t("bannerTitle")}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300">
                {displayCode}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {displayMessage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="h-8 rounded-lg text-xs font-semibold border-rose-500/30 hover:bg-rose-500/10 text-rose-700 dark:text-rose-300 cursor-pointer"
            >
              <RotateCw className={cn("size-3.5 me-1.5", isRetrying && "animate-spin")} />
              <span>{isRetrying ? t("retrying") : t("retryBtn")}</span>
            </Button>
          )}
          {onDismiss && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 rounded-lg text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. FULL SCREEN / CONTAINER VARIANT (صفحه کامل قطع ارتباط با سرور)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "w-full flex-1 min-h-[480px] flex items-center justify-center p-4 sm:p-6 lg:p-8",
        className
      )}
    >
      <div className="w-full max-w-xl mx-auto rounded-3xl border border-rose-500/20 bg-card/95 shadow-xl backdrop-blur-md p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 size-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Radar Icon with pulse effect */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute size-20 rounded-full bg-rose-500/10 animate-ping opacity-40 pointer-events-none" />
          <div className="size-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg relative z-10">
            <ServerOff className="size-8" />
          </div>
        </div>

        {/* Heading & Subheading */}
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
          {displayMessage}
        </p>

        {/* Diagnostics Info Card */}
        <div className="w-full mt-6 rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs flex flex-col gap-2.5 text-start">
          <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Globe className="size-3.5 text-primary" />
              <span>{t("targetLabel")}</span>
            </span>
            <span className="font-mono text-foreground font-semibold truncate max-w-[240px] text-left" dir="ltr">
              {targetUrl}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <ShieldAlert className="size-3.5 text-amber-500" />
              <span>{t("codeLabel")}</span>
            </span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded-md bg-rose-500/10">
              {displayCode}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <AlertTriangle className="size-3.5 text-amber-500" />
              <span>{t("statusLabel")}</span>
            </span>
            <span className={cn("font-medium text-foreground", isRtl && "fa-num")}>
              {displayStatus}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground font-medium">
              {t("timeLabel")}
            </span>
            <span className={cn("font-mono text-muted-foreground font-semibold", isRtl && "fa-num")}>
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          {onRetry && (
            <Button
              type="button"
              variant="default"
              onClick={onRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto h-11 px-6 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCw className={cn("size-4", isRetrying && "animate-spin")} />
              <span>{isRetrying ? t("retrying") : t("retryBtn")}</span>
            </Button>
          )}

          {onSwitchToMock && (
            <Button
              type="button"
              variant="outline"
              onClick={onSwitchToMock}
              className="w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-semibold border-border/60 hover:bg-muted/60 transition-colors cursor-pointer flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Database className="size-3.5 text-amber-500" />
              <span>{t("switchToMockBtn")}</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
