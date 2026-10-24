"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, MailCheck } from "lucide-react";
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
    <div className="w-full flex-1 h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-3 sm:p-4 overflow-y-auto custom-scrollbar bg-transparent">
      <Card className="w-full max-w-md shadow-xl border-border/40 bg-card/85 dark:bg-card/75 backdrop-blur-md rounded-2xl py-3.5 sm:py-4 gap-3 sm:gap-3.5 my-auto shrink-0">
        <CardHeader className="space-y-1.5 text-center pb-2">
          <div className="flex justify-center mb-1">
            <div className="bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-md border border-primary/10">
              <Logo className="text-[11px] sm:text-[12px]" showText={false} />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl sm:text-[28px] md:text-3xl font-extrabold tracking-tight text-foreground">
              {t("loginTitle")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              {t("loginSubtitle")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-3.5">
              <div className="space-y-2.5 sm:space-y-3">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs sm:text-sm">
                        {t("emailOrMobile")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            t("emailPlaceholder")
                          }
                          autoComplete="username"
                          dir="ltr"
                          disabled={isLoading}
                          className="h-9 sm:h-9.5 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs sm:text-sm">{t("password")}</FormLabel>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline" tabIndex={-1}>
                          {t("forgotPassword")}
                        </Link>
                      </div>
                      <FormControl>
                        <PasswordInput
                          placeholder="••••••••"
                          autoComplete="current-password"
                          dir="ltr"
                          disabled={isLoading}
                          className="h-9 sm:h-9.5 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {emailParam && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                  <MailCheck className="size-4 shrink-0 text-primary" />
                  <span>{t("emailPrefilledNotice")}</span>
                </div>
              )}

              {errorMsg && (
                <div className="text-xs sm:text-sm font-medium text-destructive text-center bg-destructive/10 p-2 rounded-md border border-destructive/20">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-9.5 sm:h-10 text-sm sm:text-base font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 sm:size-5 animate-spin" />
                ) : null}
                {t("login")}
              </Button>

              <div className="mt-3 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-2.5">
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium">
                  <span className="rtl:rotate-180">&larr;</span> {t("backToHome")}
                </Link>
                <div>
                  <span className="text-muted-foreground">{t("noAccount")}</span>{" "}
                  <Link
                    href="/account-request"
                    className="font-medium text-primary hover:underline"
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
