"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, Circle, AlertCircle } from "lucide-react";

import { useRouter, Link } from "@/i18n/navigation";
import { api } from "@/services";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";

function ResetPasswordContent() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Check on mount if token is missing
  useEffect(() => {
    if (!token) {
      setIsExpired(true);
    }
  }, [token]);

  // Password strength checks
  const reqs = useMemo(() => [
    { id: "length", label: t("reqLength"), test: (p: string) => p.length >= 8 },
    { id: "upper", label: t("reqUpper"), test: (p: string) => /[A-Z]/.test(p) },
    { id: "lower", label: t("reqLower"), test: (p: string) => /[a-z]/.test(p) },
    { id: "number", label: t("reqNumber"), test: (p: string) => /[0-9]/.test(p) },
    { id: "special", label: t("reqSpecial"), test: (p: string) => /[@$!%*?&]/.test(p) },
  ], [t]);

  const strengthScore = reqs.filter((req) => req.test(password)).length;
  const isPasswordValid = strengthScore === reqs.length;

  const getStrengthText = () => {
    if (strengthScore <= 1) return t("strengthWeak");
    if (strengthScore <= 3) return t("strengthFair");
    if (strengthScore === 4) return t("strengthGood");
    return t("strengthStrong");
  };

  const getStrengthColor = () => {
    if (strengthScore <= 1) return "bg-destructive";
    if (strengthScore <= 3) return "bg-orange-500";
    if (strengthScore === 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg(t("resetPasswordFailed"));
      return;
    }
    if (password !== confirm) {
      setErrorMsg(t("passwordsDoNotMatch"));
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg(t("reqLength")); // Or general message
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await api.auth.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      // Any error from the server (like 400/422 on the token) means it's invalid/expired
      setIsExpired(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-border/50">
      <CardHeader className="space-y-4 text-center pb-6">
        <div className="flex justify-center mb-2">
          <Logo className="text-3xl" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t("resetPasswordPageTitle")}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {success ? (
          <div className="flex flex-col items-center justify-center space-y-6 pb-2">
            <CheckCircle2 className="size-16 text-emerald-500" />
            <Button asChild className="w-full h-11 text-base">
              <Link href="/login">{t("backToLogin")}</Link>
            </Button>
          </div>
        ) : isExpired ? (
          <div className="flex flex-col items-center justify-center space-y-5 pb-2">
            <div className="bg-destructive/10 p-4 rounded-full">
              <AlertCircle className="size-10 text-destructive" />
            </div>
            <p className="text-center text-sm font-medium text-destructive">
              {t("resetPasswordFailed")}
            </p>
            <div className="flex flex-col w-full gap-2">
              <Button asChild className="w-full h-11 text-base mt-2" variant="default">
                <Link href="/forgot-password">{t("sendResetLink")}</Link>
              </Button>
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center justify-center gap-1 font-medium mt-2">
                <span className="rtl:rotate-180">&larr;</span> {t("backToHome")}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t("newPassword")}</Label>
              <PasswordInput
                id="new-password"
                dir="ltr"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Password Strength UI */}
            {password.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg border border-border/50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-muted-foreground">{t("passwordStrength")}</span>
                  <span className={`font-semibold ${strengthScore === 5 ? 'text-green-500' : 'text-foreground'}`}>
                    {getStrengthText()}
                  </span>
                </div>
                
                <div className="flex gap-1 h-1.5 w-full">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-full transition-colors duration-300 ${
                        index < strengthScore ? getStrengthColor() : "bg-border"
                      }`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {reqs.map((req) => {
                    const pass = req.test(password);
                    return (
                      <div key={req.id} className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${pass ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                        {pass ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <Circle className="size-3.5" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
              <PasswordInput
                id="confirm-password"
                dir="ltr"
                placeholder="••••••••"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {errorMsg && (
              <div className="text-sm font-medium text-destructive text-center bg-destructive/10 p-2.5 rounded-md border border-destructive/20">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !password || !confirm}
              className="w-full h-11 text-base"
            >
              {isSubmitting ? <Loader2 className="mr-2 size-5 animate-spin" /> : null}
              {t("submitResetPassword")}
            </Button>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 font-medium">
                <span className="rtl:rotate-180">&larr;</span> {t("backToHome")}
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("backToLogin")}
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Suspense fallback={<div className="flex justify-center"><Loader2 className="size-8 animate-spin" /></div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
