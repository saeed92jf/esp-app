"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { api, ApiError } from "@/services";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/services/core/types";
import { ROLE_HOME } from "@/lib/auth/roles";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { Loader2, CheckCircle2, Circle } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isFa = locale === "fa";
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    if (!isPasswordValid) return;
    
    setFormError(null);
    setIsSubmitting(true);

    try {
      const { user, token } = await api.auth.register({ fullName, email, password });
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        router.replace(ROLE_HOME[user.role] ?? "/dashboard");
      } else {
        // If API doesn't log them in automatically, redirect to login
        router.replace("/login");
      }
    } catch (err: any) {
      let message = err?.name === 'ApiError' ? err.message : t("errors.invalidForm");
      if (message.toLowerCase().includes("already exists")) {
        message = t("errors.emailExists");
      }
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto custom-scrollbar bg-transparent">
      <Card className="w-full max-w-md shadow-xl border-border/40 bg-card/85 dark:bg-card/75 backdrop-blur-md rounded-2xl py-3 sm:py-3.5 gap-2.5 sm:gap-3 my-auto shrink-0">
        <CardHeader className="space-y-1.5 text-center pb-1.5">
          <div className="flex justify-center mb-1">
            <div className="bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-md border border-primary/10">
              <Logo className="text-[11px] sm:text-[12px]" showText={false} />
            </div>
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-2xl sm:text-[28px] md:text-3xl font-extrabold tracking-tight text-foreground">
              {t("registerTitle")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              {t("registerSubtitle")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            <div className="space-y-2 sm:space-y-2.5">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs sm:text-sm">{t("fullName")}</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-8.5 sm:h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs sm:text-sm">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-8.5 sm:h-9 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs sm:text-sm">{t("password")}</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  dir="ltr"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="h-8.5 sm:h-9 text-xs sm:text-sm"
                />
              </div>

              {/* Password Strength UI */}
              {password.length > 0 && (
                <div className="bg-muted/40 p-2 rounded-lg border border-border/40 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] sm:text-xs">
                    <span className="font-medium text-muted-foreground">{t("passwordStrength")}</span>
                    <span className={`font-semibold ${strengthScore === 5 ? 'text-green-500' : 'text-foreground'}`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  
                  <div className="flex gap-1 h-1 w-full">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          index < strengthScore ? getStrengthColor() : "bg-border"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {reqs.map((req) => {
                      const pass = req.test(password);
                      return (
                        <span
                          key={req.id}
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] px-1.5 py-0.5 rounded transition-colors",
                            pass
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                              : "bg-muted/60 text-muted-foreground"
                          )}
                        >
                          {pass ? (
                            <CheckCircle2 className="size-3 shrink-0" />
                          ) : (
                            <Circle className="size-3 shrink-0 opacity-60" />
                          )}
                          <span>{req.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <div className="text-xs sm:text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20 text-center">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-9 sm:h-9.5 text-sm sm:text-base font-semibold"
              disabled={isSubmitting || !isPasswordValid}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 size-4 sm:size-5 animate-spin" />
              ) : null}
              {t("register")}
            </Button>
          </form>

          <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-2">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium">
              <span className="rtl:rotate-180">&larr;</span> {t("backToHome")}
            </Link>
            <div>
              <span className="text-muted-foreground">{t("haveAccount")}</span>{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t("login")}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
