"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, KeyRound } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuth } from "@/modules/auth/hooks/use-auth";
// این ایمپورت از سرویس شماست که یوزرها در آن تعریف شده‌اند
import { DEMO_USERS } from "@/modules/auth/services/auth.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isFa = locale === "fa";

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
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
      console.error("Login failed:", error);
      setErrorMsg(
        error?.message ||
          (isFa
            ? "ایمیل/موبایل یا رمز عبور اشتباه است."
            : "Invalid credentials."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  // متد برای پر کردن سریع فیلدها و اجرای لاگین
  function handleDemoLogin(demo: (typeof DEMO_USERS)[0]) {
    form.setValue("identifier", demo.email, {
      shouldValidate: true,
      shouldTouch: true,
    });
    form.setValue("password", demo.password, {
      shouldValidate: true,
      shouldTouch: true,
    });

    // اجرای لاگین با مقادیر پر شده
    onSubmit({
      identifier: demo.email,
      password: demo.password,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <Logo className="text-3xl" showText={true} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">{t("login")}</CardTitle>
            <CardDescription className="text-sm">
              {isFa
                ? "برای ورود به پنل، اطلاعات خود را وارد کنید یا از حساب‌های دمو استفاده نمایید."
                : "Enter your credentials to access the panel, or use a demo account."}
            </CardDescription>
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
                        {isFa ? "ایمیل یا موبایل" : "Email or Mobile"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            isFa ? "name@demo.com یا 0912..." : "name@demo.com"
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
                      <FormLabel>{isFa ? "رمز عبور" : "Password"}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
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

              <div className="pt-4 pb-2">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground font-medium flex items-center gap-1.5">
                      <KeyRound className="size-3.5" />
                      {isFa ? "ورود سریع دمو" : "Quick Demo Login"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {DEMO_USERS.map((demo) => (
                    <Button
                      key={demo.user.id}
                      type="button"
                      variant="outline"
                      onClick={() => handleDemoLogin(demo)}
                      disabled={isLoading}
                      className="text-xs h-9 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      {demo.user.role.charAt(0).toUpperCase() +
                        demo.user.role.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
