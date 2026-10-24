"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Mail, Send, CheckCircle2, Building2, ShieldCheck, ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { getAccountRequestSchema, type AccountRequestInput } from "@/lib/validations/auth";
import { api } from "@/services";

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

export default function AccountRequestPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<AccountRequestInput>({
    resolver: zodResolver(getAccountRequestSchema(t)),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: AccountRequestInput) {
    setIsLoading(true);
    setErrorMsg("");

    try {
      await api.auth.requestAccount({ email: data.email });
      setSubmittedEmail(data.email.trim().toLowerCase());
    } catch (error: any) {
      console.log("Account request error:", error?.message);
      setErrorMsg(error?.message || t("errors.invalidForm"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex-1 h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-3 sm:p-4 overflow-y-auto custom-scrollbar bg-transparent">
      <Card className="w-full max-w-md shadow-xl border-border/40 bg-card/85 dark:bg-card/75 backdrop-blur-md rounded-2xl py-3.5 sm:py-4 gap-3 sm:gap-3.5 my-auto shrink-0">
        
        {/* Header */}
        <CardHeader className="space-y-1.5 text-center pb-2">
          <div className="flex justify-center mb-1">
            <div className="bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-md border border-primary/10">
              <Logo className="text-[11px] sm:text-[12px]" showText={false} />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl sm:text-[26px] md:text-3xl font-extrabold tracking-tight text-foreground">
              {submittedEmail ? t("accountRequest.successTitle") : t("accountRequest.title")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              {submittedEmail ? t("accountRequest.successDesc") : t("accountRequest.subtitle")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {submittedEmail ? (
            /* Success State */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-12 mb-2 text-emerald-500" />
                <span className="text-xs text-muted-foreground">{t("accountRequest.sentToEmail")}</span>
                <span dir="ltr" className="text-sm font-semibold font-sans mt-0.5 text-foreground select-all tracking-normal">
                  {submittedEmail}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5" />
                <span>{t("accountRequest.successDesc")}</span>
              </div>

              <Button asChild className="w-full h-10 font-semibold">
                <Link href={`/login?email=${encodeURIComponent(submittedEmail)}`}>
                  {t("accountRequest.backToLogin")}
                </Link>
              </Button>

              <div className="text-center pt-1">
                <Link
                  href="/"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <span className="rtl:rotate-180">&larr;</span> {t("backToHome")}
                </Link>
              </div>
            </div>
          ) : (
            /* Request Form */
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
                
                {/* Corporate Domains Notice */}
                <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground space-y-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Building2 className="size-3.5 text-primary" />
                    <span>{t("accountRequest.allowedDomains")}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span dir="ltr" className="px-2 py-0.5 rounded-md bg-background/80 border border-border/60 text-foreground font-semibold font-sans tracking-normal">
                      @euroslotpars.com
                    </span>
                    <span dir="ltr" className="px-2 py-0.5 rounded-md bg-background/80 border border-border/60 text-foreground font-semibold font-sans tracking-normal">
                      @npceram.com
                    </span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs sm:text-sm">
                        {t("accountRequest.emailLabel")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={t("accountRequest.emailPlaceholder")}
                            autoComplete="email"
                            dir="ltr"
                            disabled={isLoading}
                            className="h-10 text-sm ltr:pl-9 rtl:pr-9 font-sans"
                            {...field}
                          />
                          <Mail className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {errorMsg && (
                  <div className="text-xs font-medium text-destructive text-center bg-destructive/10 p-2.5 rounded-md border border-destructive/20">
                    {errorMsg}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 text-sm sm:text-base font-semibold shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 size-4 sm:size-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 size-4" />
                  )}
                  {isLoading ? t("accountRequest.submitting") : t("accountRequest.submit")}
                </Button>

                <div className="mt-3 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-2.5 pt-1">
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                  >
                    <span className="rtl:rotate-180">&larr;</span> {t("backToHome")}
                  </Link>
                  <div>
                    <span className="text-muted-foreground">{t("accountRequest.haveAccount")}</span>{" "}
                    <Link
                      href="/login"
                      className="font-medium text-primary hover:underline"
                    >
                      {t("accountRequest.signIn")}
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
