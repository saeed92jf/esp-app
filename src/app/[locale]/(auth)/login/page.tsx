"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, MailCheck, Mail, Lock, LogIn, HelpCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useRouter, Link } from "@/i18n/navigation";
import { getLoginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuth } from "@/modules/auth/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Logo } from "@/components/brand/logo";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const emailParam = searchParams.get("email") || searchParams.get("identifier") || "";

  const form = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: {
      identifier: emailParam,
      password: "",
    },
  });

  useEffect(() => {
    if (emailParam) {
      form.setValue("identifier", emailParam);
    }
  }, [emailParam, form]);

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (login) {
        const user = await login(data.identifier, data.password);
        if (user) {
          // If profile is not yet completed, redirect immediately to profile setup
          if (!user.isProfileCompleted || user.accountStatus === "pending_profile") {
            router.push("/dashboard/profile?onboarding=true");
            router.refresh();
            return;
          }
          // If not active / not yet final approved by manager, ALWAYS go directly to /account-pending
          const isFullyApproved = Boolean(
            user.accountStatus === "active" || (user.hrApproved && user.managerApproved)
          );
          if (!isFullyApproved) {
            router.push("/account-pending");
            router.refresh();
            return;
          }
        }
      }
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.log("Login failed:", error?.message);
      const isAuthError = error?.status === 401 || error?.status === 400;
      setErrorMsg(
        isAuthError
          ? t("errors.invalidCredentials")
          : error?.message || t("errors.invalidCredentials")
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex-1 h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-transparent">
      <Card className="w-full max-w-[500px] shadow-2xl border-border/50 bg-card/90 dark:bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 my-auto shrink-0 transition-all">
        
        {/* Header */}
        <CardHeader className="space-y-3 text-center p-0 pb-6">
          <div className="flex justify-center mb-1">
            <div className="bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20 shadow-xs">
              <Logo className="text-xs sm:text-sm" showText={false} />
            </div>
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t("loginTitle")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {t("loginSubtitle")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              
              <div className="space-y-4">
                {/* Identifier (Email / Mobile) */}
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t("emailOrMobile")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          {/* Rule 12: Fixed icon positioning for LTR input */}
                          <Input
                            placeholder={t("emailPlaceholder")}
                            autoComplete="username"
                            dir="ltr"
                            disabled={isLoading}
                            className="h-11 sm:h-12 text-sm sm:text-base pl-10 pr-3 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors"
                            {...field}
                          />
                          <Mail className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs sm:text-sm font-medium">
                        {t("password")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <PasswordInput
                            placeholder="••••••••"
                            autoComplete="current-password"
                            dir="ltr"
                            disabled={isLoading}
                            className="h-11 sm:h-12 text-sm sm:text-base pl-10 pr-10 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors"
                            {...field}
                          />
                          <Lock className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Explanatory / Links Row providing generous separation between input and submit button */}
              <div className="flex items-center justify-between text-xs sm:text-sm px-1 py-1">
                <Link
                  href="/forgot-password"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>{t("forgotPassword")}</span>
                </Link>
                <a
                  href="mailto:ESP.Technical.Support@euroslotpars.com"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium inline-flex items-center gap-1 text-xs"
                >
                  <HelpCircle className="size-3.5 text-muted-foreground" />
                  <span>{t("troubleLoggingIn")}</span>
                </a>
              </div>

              {emailParam && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs sm:text-sm text-primary font-medium">
                  <MailCheck className="size-4.5 shrink-0 text-primary" />
                  <span>{t("emailPrefilledNotice")}</span>
                </div>
              )}

              {errorMsg && (
                <div className="text-xs sm:text-sm font-medium text-destructive text-center bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                  {errorMsg}
                </div>
              )}

              {/* Concise Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl shadow-md shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 sm:size-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 size-4 sm:size-4.5" />
                )}
                {isLoading ? t("loggingIn") : t("login")}
              </Button>

              {/* Bottom Navigation Links */}
              <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-3">
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                >
                  <span className="rtl:rotate-180">&larr;</span> {t("backToHome")}
                </Link>
                <div>
                  <span className="text-muted-foreground">{t("noAccount")}</span>{" "}
                  <Link
                    href="/account-request"
                    className="font-semibold text-primary hover:underline"
                  >
                    {t("requestAccount")}
                  </Link>
                </div>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
