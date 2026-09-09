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
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <Logo className="text-3xl" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">{t("register")}</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fullName")}</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  dir="ltr"
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
            </div>

            {formError && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 p-2.5 rounded-md border border-destructive/20 text-center">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isSubmitting || !isPasswordValid}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 size-5 animate-spin" />
              ) : null}
              {t("register")}
            </Button>
          </form>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm gap-4">
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
