"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle,
  KeyRound,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Check,
  Edit2,
} from "lucide-react";

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
import { cn } from "@/lib/utils";

function ResetPasswordContent() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();

  // Query parameters from URL
  const token =
    searchParams.get("token") ||
    searchParams.get("code") ||
    searchParams.get("key") ||
    "";
  const queryEmail =
    searchParams.get("email") ||
    searchParams.get("identifier") ||
    searchParams.get("user") ||
    searchParams.get("username") ||
    searchParams.get("mail") ||
    "";

  const [email, setEmail] = useState(queryEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const effectiveToken = token || "demo-token";

  // Auto-detect email from JWT token or local storage on client mount
  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
      return;
    }

    if (token && token.includes(".")) {
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(
            atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
          );
          const found =
            payload.email ||
            payload.user_email ||
            (typeof payload.sub === "string" && payload.sub.includes("@")
              ? payload.sub
              : "");
          if (found) {
            setEmail(found);
            return;
          }
        } catch {}
      }
    }

    try {
      const stored =
        sessionStorage.getItem("esp_reset_email") ||
        localStorage.getItem("esp_reset_email");
      if (stored && stored.includes("@")) {
        setEmail(stored);
        return;
      }

      const userJson =
        localStorage.getItem("esp-auth-user") ||
        localStorage.getItem("esp_auth_user");
      if (userJson) {
        const u = JSON.parse(userJson);
        if (u?.email) {
          setEmail(u.email);
        }
      }
    } catch {}
  }, [token, queryEmail]);

  // Real backend specification: min 12 chars, upper, lower, number, symbol
  const reqs = useMemo(
    () => [
      {
        id: "length",
        label: isRtl ? "حداقل ۱۲ کاراکتر" : "At least 12 characters",
        test: (p: string) => p.length >= 12,
      },
      {
        id: "upper",
        label: isRtl ? "حداقل یک حرف بزرگ (A-Z)" : "At least one uppercase (A-Z)",
        test: (p: string) => /[A-Z]/.test(p),
      },
      {
        id: "lower",
        label: isRtl ? "حداقل یک حرف کوچک (a-z)" : "At least one lowercase (a-z)",
        test: (p: string) => /[a-z]/.test(p),
      },
      {
        id: "number",
        label: isRtl ? "حداقل یک عدد (0-9)" : "At least one number (0-9)",
        test: (p: string) => /[0-9]/.test(p),
      },
      {
        id: "special",
        label: isRtl ? "حداقل یک نماد ویژه (@$!%*?&...)" : "At least one symbol (@$!%*?&...)",
        test: (p: string) => /[@$!%*?&#^~_\-.]/.test(p),
      },
    ],
    [isRtl]
  );

  const strengthScore = reqs.filter((req) => req.test(password)).length;
  const isPasswordValid = strengthScore === reqs.length;
  const doPasswordsMatch = Boolean(confirm && password && password === confirm);
  const showMismatchError = Boolean(confirm && password && password !== confirm);

  const getStrengthText = () => {
    if (strengthScore <= 1) return isRtl ? "بسیار ضعیف" : t("strengthWeak");
    if (strengthScore <= 2) return isRtl ? "ضعیف" : t("strengthWeak");
    if (strengthScore <= 3) return isRtl ? "متوسط" : t("strengthFair");
    if (strengthScore === 4) return isRtl ? "خوب" : t("strengthGood");
    return isRtl ? "بسیار قوی و ایمن" : t("strengthStrong");
  };

  const getStrengthColor = () => {
    if (strengthScore <= 1) return "bg-destructive";
    if (strengthScore <= 2) return "bg-destructive";
    if (strengthScore <= 3) return "bg-orange-500";
    if (strengthScore === 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalEmail = (email || queryEmail || "").trim();
    if (finalEmail && !finalEmail.includes("@")) {
      setErrorMsg(isRtl ? "لطفاً نشانی ایمیل معتبر حساب خود را وارد نمایید." : "Please enter a valid account email address.");
      return;
    }

    if (password.length < 12) {
      setErrorMsg(isRtl ? "طول رمز عبور جدید باید حداقل ۱۲ کاراکتر باشد." : "Password must be at least 12 characters.");
      return;
    }

    if (password !== confirm) {
      setErrorMsg(t("passwordsDoNotMatch"));
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 850));
      await Promise.all([
        api.auth.resetPassword({
          email: finalEmail ? finalEmail.toLowerCase() : undefined,
          token: effectiveToken.trim(),
          new_password: password,
          confirmPassword: confirm,
        }),
        minDelay,
      ]);
      setSuccess(true);
      // NOTE: Deliberately do not set isSubmitting to false so the button stays spinning smoothly until success card mounts
    } catch (err: any) {
      const isInvalidToken =
        err?.status === 400 ||
        err?.status === 401 ||
        err?.status === 404 ||
        err?.code === "INVALID_OR_EXPIRED_TOKEN";

      if (isInvalidToken) {
        setIsExpired(true);
      } else {
        let msg = err?.message;
        if (err?.status === 422 && err?.details) {
          const detailMsgs = Object.values(err.details).flat();
          if (detailMsgs.length > 0) {
            msg = detailMsgs.join(" - ");
          }
        }
        setErrorMsg(
          msg ||
            (isRtl
              ? "خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید."
              : "Failed to reset password. Please try again.")
        );
      }
      setIsSubmitting(false);
    }
  };

  const hasDetectedEmail = Boolean(email && email.includes("@") && !isEditingEmail);

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
            {success ? t("resetPasswordSuccess") : t("resetPasswordPageTitle")}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {success
              ? (isRtl
                  ? "رمز عبور جدید شما با موفقیت ذخیره شد."
                  : "Your new password has been successfully saved.")
              : t("resetPasswordPageSubtitle")}
          </CardDescription>
        </div>

        {/* User Email Badge */}
        {hasDetectedEmail && !success && (
          <div className="pt-1.5 flex items-center justify-center gap-2">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium shadow-xs"
              dir="ltr"
            >
              <Mail className="size-3.5" />
              <span>{email}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingEmail(true)}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              title={isRtl ? "ویرایش ایمیل" : "Edit email"}
            >
              <Edit2 className="size-3" />
              <span>{isRtl ? "ویرایش" : "Edit"}</span>
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          {success ? (
            /* ─── Success State ─────────────────────────────────────────── */
            <motion.div
              key="reset-success"
              initial={{ opacity: 0, scale: 0.88, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280, duration: 0.4 }}
              className="space-y-5 text-center py-2"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 350, damping: 15 }}
                className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs mx-auto"
              >
                <CheckCircle2 className="size-9 stroke-[2.5]" />
              </motion.div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {isRtl ? "تغییر رمز با موفقیت انجام شد" : "Password Reset Successfully"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  {isRtl
                    ? "اکنون می‌توانید با رمز عبور جدید وارد حساب کاربری خود شوید."
                    : "You can now sign in to your corporate account with your updated credentials."}
                </p>
              </div>

              <Button asChild className="w-full h-11 sm:h-12 text-sm font-semibold rounded-xl shadow-md shadow-primary/20 cursor-pointer">
                <Link href={email ? `/login?email=${encodeURIComponent(email)}` : "/login"}>
                  <span>{t("backToLogin")}</span>
                </Link>
              </Button>
            </motion.div>
          ) : isExpired ? (
            /* ─── Expired / Invalid Token State ─────────────────────────── */
            <motion.div
              key="reset-expired"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="space-y-5 text-center py-2"
            >
              <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20 shadow-xs mx-auto">
                <AlertCircle className="size-9 stroke-[2.5]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {t("resetPasswordFailed")}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  {isRtl
                    ? "این لینک بازیابی نامعتبر است یا منقضی شده است. لطفاً مجدداً درخواست ارسال لینک دهید."
                    : "This reset link is invalid or has expired. Please request a new link."}
                </p>
              </div>

              <div className="flex flex-col w-full gap-2.5 pt-2">
                <Button asChild className="w-full h-11 text-sm font-semibold rounded-xl shadow-md shadow-primary/20 cursor-pointer">
                  <Link href={email ? `/forgot-password?email=${encodeURIComponent(email)}` : "/forgot-password"}>
                    {t("sendResetLink")}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-10 text-xs font-semibold rounded-xl border-border/60 cursor-pointer">
                  <Link href="/login">{t("backToLogin")}</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            /* ─── Reset Password Form ───────────────────────────────────── */
            <motion.form
              key="reset-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.25, ease: "easeInOut" } }}
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5"
            >
              {/* Account Email (shown if not detected or editing) */}
              {(!hasDetectedEmail || isEditingEmail) && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="account-email" className="text-xs sm:text-sm font-medium">
                      {t("email")}
                    </Label>
                    {isEditingEmail && (
                      <button
                        type="button"
                        onClick={() => setIsEditingEmail(false)}
                        className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {isRtl ? "انصراف" : "Cancel"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="account-email"
                      type="email"
                      dir="ltr"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      disabled={isSubmitting}
                      className="h-11 sm:h-12 text-sm sm:text-base pl-10 pr-3 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors"
                    />
                    <Mail className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* New Password Input */}
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs sm:text-sm font-medium">
                  {t("newPassword")}
                </Label>
                <div className="relative">
                  <PasswordInput
                    id="new-password"
                    dir="ltr"
                    placeholder={isRtl ? "رمز عبور جدید (حداقل ۱۲ کاراکتر)" : "New password (at least 12 characters)"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="h-11 sm:h-12 text-sm sm:text-base pl-10 pr-10 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors auth-input-ltr"
                  />
                  <Lock className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password Strength UI - Permanently visible requirements checklist */}
              <div className="bg-muted/40 p-3 sm:p-3.5 rounded-2xl border border-border/50 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-muted-foreground">{t("passwordStrength")}</span>
                  <span
                    className={cn(
                      "font-semibold transition-colors duration-200",
                      password.length === 0
                        ? "text-muted-foreground"
                        : strengthScore === 5
                        ? "text-green-500"
                        : "text-foreground"
                    )}
                  >
                    {password.length === 0
                      ? (isRtl ? "الزامات امنیتی" : "Security requirements")
                      : getStrengthText()}
                  </span>
                </div>

                <div className="flex gap-1 h-1.5 w-full">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-full transition-colors duration-300 ${
                        password.length > 0 && index < strengthScore ? getStrengthColor() : "bg-border/60"
                      }`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {reqs.map((req) => {
                    const pass = req.test(password);
                    return (
                      <div
                        key={req.id}
                        className={cn(
                          "flex items-center gap-1.5 text-xs transition-colors duration-200",
                          pass ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground/75"
                        )}
                      >
                        {pass ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-green-500" />
                        ) : (
                          <Circle className="size-3.5 shrink-0 opacity-40" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="confirm-password" className="text-xs sm:text-sm font-medium">
                    {t("confirmPassword")}
                  </Label>
                  {doPasswordsMatch && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="size-3 stroke-[3]" />
                      <span>{isRtl ? "تطابق کامل رمز" : "Passwords match"}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <PasswordInput
                    id="confirm-password"
                    dir="ltr"
                    placeholder={isRtl ? "تکرار رمز عبور جدید" : "Repeat new password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={isSubmitting}
                    className={cn(
                      "h-11 sm:h-12 text-sm sm:text-base pl-10 pr-10 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors auth-input-ltr",
                      showMismatchError && "border-destructive focus-visible:ring-destructive",
                      doPasswordsMatch && "border-emerald-500"
                    )}
                  />
                  <Lock className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                </div>
                {showMismatchError && (
                  <p className="text-[11px] font-medium text-destructive">
                    {t("passwordsDoNotMatch")}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="text-xs font-semibold text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 text-center flex items-center justify-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button with smooth, continuous animated loading state */}
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !password ||
                  !confirm ||
                  password.length < 12 ||
                  password !== confirm
                }
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
                      {isRtl ? "در حال ثبت رمز جدید..." : "Saving password..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <KeyRound className="size-4.5" />
                    <span>{t("submitResetPassword")}</span>
                  </div>
                )}
              </Button>

              {/* Navigation links */}
              <div className="pt-2 flex items-center justify-between text-xs sm:text-sm text-muted-foreground border-t border-border/40">
                <Link
                  href="/login"
                  className="hover:text-foreground transition-colors font-medium flex items-center gap-1"
                >
                  <span>{t("backToLogin")}</span>
                </Link>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors font-medium flex items-center gap-1"
                >
                  <span>{t("backToHome")}</span>
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full flex-1 min-h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-transparent">
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
