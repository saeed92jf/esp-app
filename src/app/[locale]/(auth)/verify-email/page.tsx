"use client";

import { useEffect, useState, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, LogIn } from "lucide-react";

import { useRouter, Link } from "@/i18n/navigation";
import { api } from "@/services";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";

function VerifyEmailContent() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isFa = locale === "fa";
  const BackArrow = isFa ? ArrowRight : ArrowLeft;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg(t("verifyEmailFailed"));
      return;
    }

    const verify = async () => {
      try {
        await api.auth.verifyEmail(token);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err?.message || t("verifyEmailFailed"));
      }
    };

    verify();
  }, [token, t]);

  return (
    <Card className="w-full max-w-[480px] shadow-2xl border-border/50 bg-card/90 dark:bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 my-auto shrink-0 transition-all relative overflow-hidden">
      {/* Subtle Ambient Radial Glow */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-30 bg-gradient-to-b from-primary/30 to-indigo-500/10" />

      {/* Header */}
      <CardHeader className="space-y-3 text-center p-0 pb-6">
        <div className="flex justify-center mb-1">
          <div className="bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20 shadow-xs">
            <Logo className="text-xs sm:text-sm" showText={false} />
          </div>
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-foreground">
            {t("verifyEmailTitle")}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {status === "loading" && (isFa ? "در حال تأیید هویت و اعتبارسنجی نشانی ایمیل..." : t("verifyEmailLoading"))}
            {status === "success" && (isFa ? "ایمیل سازمانی شما با موفقیت تأیید گردید." : t("verifyEmailSuccess"))}
            {status === "error" && (isFa ? "پیوند اعتبارسنجی منقضی شده یا نامعتبر است." : errorMsg)}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="verifying-loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center space-y-4 py-8"
            >
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium animate-pulse">
                {t("verifyEmailLoading")}
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="verifying-success"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="space-y-5 text-center py-4"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
                className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs mx-auto"
              >
                <CheckCircle2 className="size-9 stroke-[2.5]" />
              </motion.div>

              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                {t("verifyEmailSuccess")}
              </div>

              <Button asChild className="w-full h-11 sm:h-12 rounded-xl text-sm sm:text-base font-semibold shadow-md shadow-primary/20">
                <Link href="/login" className="flex items-center justify-center gap-2">
                  <LogIn className="size-4.5" />
                  <span>{t("backToLogin")}</span>
                </Link>
              </Button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="verifying-error"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="space-y-5 text-center py-4"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
                className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20 shadow-xs mx-auto"
              >
                <AlertCircle className="size-9 stroke-[2.5]" />
              </motion.div>

              <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/20 text-xs sm:text-sm text-destructive font-medium">
                {errorMsg || t("verifyEmailFailed")}
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full h-11 sm:h-12 rounded-xl text-sm sm:text-base font-semibold shadow-md shadow-primary/20">
                  <Link href="/login" className="flex items-center justify-center gap-2">
                    <LogIn className="size-4.5" />
                    <span>{t("backToLogin")}</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-10 rounded-xl text-xs sm:text-sm">
                  <Link href="/account-request">
                    {t("requestAccount")}
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t border-border/40 text-center">
          <Link
            href="/"
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 font-medium"
          >
            <BackArrow className="size-3.5" /> {t("backToHome")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="w-full flex-1 min-h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-transparent">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
