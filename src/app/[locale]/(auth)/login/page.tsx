"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";

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

  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isFa = locale === "fa";

  const form = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (login) {
        // ارسال جداگانه شناسنامه و رمز عبور (طبق امضای سرویس شما)
        await login(data.identifier, data.password);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      // Use console.log to prevent Next.js dev overlay from catching expected auth errors
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
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <Logo className="text-3xl" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">{t("login")}</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
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
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>{t("password")}</FormLabel>
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline" tabIndex={-1}>
                          {t("forgotPassword")}
                        </Link>
                      </div>
                      <FormControl>
                        <PasswordInput
                          placeholder="••••••••"
                          autoComplete="current-password"
                          dir="ltr"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {errorMsg && (
                <div className="text-sm font-medium text-destructive text-center bg-destructive/10 p-2.5 rounded-md border border-destructive/20">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 size-5 animate-spin" />
                ) : null}
                {t("login")}
              </Button>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm gap-4">
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium">
                  <span className="rtl:rotate-180">&larr;</span> {t("backToHome")}
                </Link>
                <div>
                  <span className="text-muted-foreground">{t("noAccount")}</span>{" "}
                  <Link
                    href="/register"
                    className="font-medium text-primary hover:underline"
                  >
                    {t("createAccount")}
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
