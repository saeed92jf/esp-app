"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Send, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { api } from "@/services";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isFa = locale === "fa";
  const BackArrow = isFa ? ArrowRight : ArrowLeft;

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setFormError(isFa ? "لطفاً نشانی ایمیل معتبر وارد کنید." : "Please enter a valid email address.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      // Ensure a buttery-smooth minimum loading window (850ms) so the spinner runs smoothly without jitter
      const minDelay = new Promise((resolve) => setTimeout(resolve, 850));
      await Promise.all([
        api.auth.forgotPassword(cleanEmail),
        minDelay,
      ]);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("esp_reset_email", cleanEmail);
          localStorage.setItem("esp_reset_email", cleanEmail);
        } catch {}
      }
      setSentEmail(cleanEmail);
      setSuccess(true);
      // NOTE: We deliberately do NOT call setIsSubmitting(false) here.
      // Keeping isSubmitting = true guarantees the button stays actively spinning 
      // during the entire form exit animation until the success card smoothly springs in!
    } catch (err: any) {
      let message =
        err?.message ||
        (isFa
          ? "ارسال لینک با خطا مواجه شد. لطفاً دوباره تلاش کنید."
          : "Failed to send reset link. Please try again.");

      if (err?.status === 422 && err?.details) {
        const details = Object.values(err.details).flat().join(" - ");
        if (details) message = `${message} (${details})`;
      }

      setFormError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 min-h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-transparent">
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
              {success ? t("resetLinkSent") : t("forgotPasswordTitle")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {success
                ? (isFa
                    ? "لینک بازیابی رمز عبور به ایمیل سازمانی شما ارسال گردید."
                    : "Password reset link has been dispatched to your corporate email.")
                : t("forgotPasswordSubtitle")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.25, ease: "easeInOut" } }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
                    {t("email")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder={isFa ? "ایمیل سازمانی (name@company.com)" : "name@company.com"}
                      dir="ltr"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="h-11 sm:h-12 text-sm sm:text-base pl-10 pr-3.5 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors auth-input-ltr"
                    />
                    <Mail className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                  </div>
                </div>

                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs sm:text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 text-center flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{formError}</span>
                  </motion.div>
                )}

                {/* Submit Button with smooth, continuous animated loading state */}
                <Button
                  type="submit"
                  disabled={!email.trim() || isSubmitting}
                  className={cn(
                    "w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl shadow-md shadow-primary/20 transition-all relative overflow-hidden select-none",
                    isSubmitting
                      ? "opacity-100 disabled:opacity-100 cursor-wait bg-primary pointer-events-none"
                      : "cursor-pointer hover:opacity-95 active:scale-[0.99]"
                  )}
                >
                  {isSubmitting && (
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.5s_infinite]" />
                  )}
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium animate-pulse">
                        {isFa ? "در حال ارسال لینک..." : "Sending link..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send className="size-4 rtl:rotate-180" />
                      <span>{t("sendResetLink")}</span>
                    </div>
                  )}
                </Button>

                {/* Bottom Navigation */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs sm:text-sm">
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <BackArrow className="size-4" />
                    <span>{t("backToLogin")}</span>
                  </Link>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    <span>{t("backToHome")}</span>
                  </Link>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="forgot-success"
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="space-y-5 text-center py-2"
              >
                {/* Bouncy Pop Checkmark */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
                  className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs mx-auto"
                >
                  <CheckCircle2 className="size-9 stroke-[2.5]" />
                </motion.div>

                <div className="space-y-2">
                  <div
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium shadow-xs"
                    dir="ltr"
                  >
                    <Mail className="size-3.5" />
                    <span>{sentEmail}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    {isFa
                      ? "لطفاً صندوق ورودی (Inbox) و پوشه هرزنامه (Spam) ایمیل خود را بررسی نمایید."
                      : "Please check your inbox and spam folder for the recovery link."}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Button asChild className="w-full h-11 sm:h-12 text-sm font-semibold rounded-xl shadow-md shadow-primary/20 cursor-pointer">
                    <Link href={`/login?email=${encodeURIComponent(sentEmail)}`}>
                      <span>{t("backToLogin")}</span>
                    </Link>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSuccess(false);
                      setIsSubmitting(false);
                      setFormError(null);
                    }}
                    className="w-full h-10 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <span>{isFa ? "ارسال مجدد به ایمیلی دیگر" : "Send to a different email"}</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
