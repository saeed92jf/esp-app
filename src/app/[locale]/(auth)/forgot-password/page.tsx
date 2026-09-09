"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { api, ApiError } from "@/services";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocale } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isFa = locale === "fa";

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await api.auth.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      let message =
        err?.name === 'ApiError'
          ? err.message
          : isFa
          ? "خطایی رخ داد. لطفا دوباره تلاش کنید."
          : "An error occurred. Please try again.";
          
      // Append validation details if they exist
      if (err?.name === 'ApiError' && err.details && Object.keys(err.details).length > 0) {
        const reasons = Object.values(err.details).flat().join(" - ");
        message = `${message} (${reasons})`;
      }
      
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col justify-center">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">{t("forgotPasswordTitle")}</h1>
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {formError && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-2.5 rounded-md border border-destructive/20 text-center">
              {formError}
            </div>
          )}

          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 size-5 animate-spin" />
            ) : null}
            {t("sendResetLink")}
          </Button>
        </form>
      ) : (
        <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg text-center space-y-4">
          <div className="text-primary text-5xl flex justify-center mb-2">
            ✓
          </div>
          <h3 className="font-medium text-lg">{t("resetLinkSent")}</h3>
          <p className="text-muted-foreground text-sm">
            {isFa
              ? "لطفا پوشه اینباکس و اسپم ایمیل خود را بررسی کنید."
              : "Please check your email inbox and spam folder."}
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center gap-4">
        <Link
          href="/login"
          className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1 transition-colors"
        >
          {isFa ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
          {t("backToLogin")}
        </Link>
        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 font-medium">
          <span className="rtl:rotate-180">&larr;</span> {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
