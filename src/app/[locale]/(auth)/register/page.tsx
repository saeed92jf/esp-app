"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { 
  Loader2, 
  CheckCircle2, 
  Circle, 
  User, 
  Mail, 
  Lock, 
  UserPlus, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle 
} from "lucide-react";

import { useRouter, Link } from "@/i18n/navigation";
import { api } from "@/services";
import { AUTH_USER_KEY } from "@/services/core/types";
import { setAuthToken } from "@/lib/auth/token-storage";
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
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isFa = locale === "fa";
  const BackArrow = isFa ? ArrowRight : ArrowLeft;
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Corporate password security rules (aligned with real backend constraints)
  const reqs = useMemo(
    () => [
      {
        id: "length",
        label: isFa ? "حداقل ۱۲ کاراکتر" : "At least 12 characters",
        test: (p: string) => p.length >= 12,
      },
      {
        id: "upper",
        label: isFa ? "حرف بزرگ انگلیسی (A-Z)" : "Uppercase letter (A-Z)",
        test: (p: string) => /[A-Z]/.test(p),
      },
      {
        id: "lower",
        label: isFa ? "حرف کوچک انگلیسی (a-z)" : "Lowercase letter (a-z)",
        test: (p: string) => /[a-z]/.test(p),
      },
      {
        id: "number",
        label: isFa ? "عدد (0-9)" : "Number (0-9)",
        test: (p: string) => /[0-9]/.test(p),
      },
      {
        id: "special",
        label: isFa ? "کاراکتر خاص (@$!%*?&#^)" : "Special character (@$!%*?&#^)",
        test: (p: string) => /[@$!%*?&#^_\-+=~`]/.test(p),
      },
    ],
    [isFa]
  );

  const passedCount = reqs.filter((req) => req.test(password)).length;
  const isPasswordValid = passedCount === reqs.length;

  const getStrengthMeta = () => {
    if (passedCount <= 1)
      return {
        label: isFa ? "بسیار ضعیف" : "Very Weak",
        color: "bg-destructive",
        textColor: "text-destructive",
      };
    if (passedCount === 2)
      return {
        label: isFa ? "ضعیف" : "Weak",
        color: "bg-amber-500",
        textColor: "text-amber-500",
      };
    if (passedCount === 3)
      return {
        label: isFa ? "متوسط" : "Fair",
        color: "bg-amber-500",
        textColor: "text-amber-500",
      };
    if (passedCount === 4)
      return {
        label: isFa ? "خوب" : "Good",
        color: "bg-emerald-500",
        textColor: "text-emerald-500",
      };
    return {
      label: isFa ? "عالی و امن" : "Strong & Secure",
      color: "bg-emerald-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
    };
  };

  const strengthMeta = getStrengthMeta();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setFormError(null);
    setIsSubmitting(true);

    try {
      const { user, token } = await api.auth.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setIsSuccess(true);

      setTimeout(() => {
        if (token) {
          setAuthToken(token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          localStorage.setItem("esp_auth_user", JSON.stringify(user));
          router.replace(ROLE_HOME[user.role] ?? "/dashboard");
        } else {
          router.replace("/login");
        }
      }, 700);
    } catch (err: any) {
      let message = err?.message || t("errors.invalidForm");
      if (message.toLowerCase().includes("already exists")) {
        message = t("errors.emailExists");
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
              {isSuccess ? (isFa ? "حساب با موفقیت ایجاد شد" : "Account Created") : t("registerTitle")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {isSuccess
                ? (isFa ? "در حال هدایت به سامانه..." : "Redirecting to workspace...")
                : t("registerSubtitle")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="register-success"
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="space-y-5 text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
                  className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs mx-auto"
                >
                  <CheckCircle2 className="size-9 stroke-[2.5]" />
                </motion.div>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>{isFa ? "لطفاً چند لحظه صبر کنید..." : "Please wait a moment..."}</span>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.2 } }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
                    {t("fullName")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder={isFa ? "نام و نام خانوادگی" : "Full Name"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isSubmitting}
                      className={cn(
                        "h-11 sm:h-12 text-sm sm:text-base font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors",
                        isFa ? "pr-10 pl-3.5 text-right rtl:placeholder:text-right" : "pl-10 pr-3.5 text-left"
                      )}
                    />
                    <User className={cn(
                      "size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 pointer-events-none",
                      isFa ? "right-3.5" : "left-3.5"
                    )} />
                  </div>
                </div>

                {/* Corporate Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
                    {t("email")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      dir="ltr"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="h-11 sm:h-12 text-sm sm:text-base pl-10 pr-3 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors"
                    />
                    <Mail className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs sm:text-sm font-medium">
                    {t("password")}
                  </Label>
                  <div className="relative">
                    <PasswordInput
                      id="password"
                      placeholder={isFa ? "رمز عبور جدید (حداقل ۱۲ کاراکتر)" : "Password (min 12 chars)"}
                      autoComplete="new-password"
                      dir="ltr"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="h-11 sm:h-12 text-sm sm:text-base pl-10 pr-10 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors"
                    />
                    <Lock className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Real-time Password Strength Meter */}
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      {isFa ? "شاخص امنیت رمز:" : "Security Level:"}
                    </span>
                    <span className={cn("font-bold text-xs", strengthMeta.textColor)}>
                      {strengthMeta.label}
                    </span>
                  </div>

                  {/* 5-segment strength progress bar */}
                  <div className="flex gap-1.5 h-1.5 w-full">
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex-1 rounded-full transition-all duration-300",
                          idx < passedCount ? strengthMeta.color : "bg-border/60"
                        )}
                      />
                    ))}
                  </div>

                  {/* Rule Checklist */}
                  <div className="pt-1 grid grid-cols-1 gap-1 text-[11px] sm:text-xs">
                    {reqs.map((req) => {
                      const passed = req.test(password);
                      return (
                        <div
                          key={req.id}
                          className={cn(
                            "flex items-center gap-1.5 transition-colors leading-relaxed",
                            passed
                              ? "text-emerald-600 dark:text-emerald-400 font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {passed ? (
                            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                          ) : (
                            <Circle className="size-3.5 shrink-0 opacity-40" />
                          )}
                          <span>{req.label}</span>
                        </div>
                      );
                    })}
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
                  disabled={isSubmitting || !isPasswordValid || !fullName.trim() || !email.trim()}
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
                      <span className="font-medium animate-pulse">{isFa ? "در حال ایجاد حساب..." : "Creating account..."}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="size-4" />
                      <span>{t("register")}</span>
                    </div>
                  )}
                </Button>

                {/* Bottom Navigation Links */}
                <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-3">
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                  >
                    <BackArrow className="size-3.5" /> {t("backToHome")}
                  </Link>
                  <div>
                    <span className="text-muted-foreground">{t("haveAccount")}</span>{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-primary hover:underline"
                    >
                      {t("login")}
                    </Link>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
