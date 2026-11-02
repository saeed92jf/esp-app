"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Mail, Send, CheckCircle2, Building2, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";

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
import { cn } from "@/lib/utils";

export default function AccountRequestPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isFa = locale === "fa";
  const BackArrow = isFa ? ArrowRight : ArrowLeft;

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
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 850));
      await Promise.all([
        api.auth.requestAccount({ email: data.email }),
        minDelay,
      ]);
      setSubmittedEmail(data.email.trim().toLowerCase());
    } catch (error: any) {
      console.log("Account request error:", error?.message);
      setErrorMsg(error?.message || t("errors.invalidForm"));
      setIsLoading(false);
    }
  }

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
              {submittedEmail ? t("accountRequest.successTitle") : t("accountRequest.title")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {submittedEmail ? t("accountRequest.successDesc") : t("accountRequest.subtitle")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {submittedEmail ? (
              /* Success State with spring Zoom-Fade animation */
              <motion.div
                key="account-request-success"
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="space-y-5"
              >
                <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <CheckCircle2 className="size-16 mb-2 text-emerald-500" />
                  </motion.div>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {t("accountRequest.sentToEmail")}
                  </span>
                  <span dir="ltr" className="text-base font-semibold font-sans mt-1 text-foreground select-all tracking-normal">
                    {submittedEmail}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs sm:text-sm text-muted-foreground leading-relaxed flex items-start gap-2.5">
                  <ShieldCheck className="size-4.5 shrink-0 text-primary mt-0.5" />
                  <span>{t("accountRequest.successDesc")}</span>
                </div>

                <Button asChild className="w-full h-11 sm:h-12 rounded-xl text-sm sm:text-base font-semibold shadow-md shadow-primary/20">
                  <Link href={`/login?email=${encodeURIComponent(submittedEmail)}`}>
                    {t("accountRequest.backToLogin")}
                  </Link>
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 font-medium"
                  >
                    <BackArrow className="size-3.5" /> {t("backToHome")}
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Request Form */
              <motion.div
                key="account-request-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.2 } }}
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    
                    {/* Corporate Domains Notice */}
                    <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground space-y-2">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Building2 className="size-4 text-primary" />
                        <span>{t("accountRequest.allowedDomains")}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span dir="ltr" className="px-2.5 py-1 rounded-lg bg-background/80 border border-border/60 text-foreground font-semibold font-sans tracking-normal shadow-2xs">
                          @euroslotpars.com
                        </span>
                        <span dir="ltr" className="px-2.5 py-1 rounded-lg bg-background/80 border border-border/60 text-foreground font-semibold font-sans tracking-normal shadow-2xs">
                          @npceram.com
                        </span>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-xs sm:text-sm font-medium">
                            {t("accountRequest.emailLabel")}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder={isFa ? "name@euroslotpars.com یا name@npceram.com" : "name@euroslotpars.com"}
                                autoComplete="email"
                                dir="ltr"
                                disabled={isLoading}
                                className="h-11 sm:h-12 text-sm sm:text-base pl-10 pr-3.5 font-sans rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors auth-input-ltr"
                                {...field}
                              />
                              <Mail className="size-4.5 text-muted-foreground/70 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Explanatory text & Support Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 leading-relaxed">
                        <ShieldCheck className="size-3.5 text-primary shrink-0" />
                        <span>{t("accountRequest.helperNotice")}</span>
                      </div>
                      <a
                        href="mailto:ESP.Technical.Support@euroslotpars.com"
                        className="text-primary hover:underline font-medium shrink-0 inline-flex items-center gap-1 self-start sm:self-center"
                      >
                        <span>{t("accountRequest.supportLink")}</span>
                      </a>
                    </div>

                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs sm:text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 text-center flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}

                    {/* Submit Button with smooth, continuous animated loading state */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        "w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl shadow-md shadow-primary/20 transition-all relative overflow-hidden select-none",
                        isLoading
                          ? "opacity-100 disabled:opacity-100 cursor-wait bg-primary pointer-events-none"
                          : "cursor-pointer hover:opacity-95 active:scale-[0.99]"
                      )}
                    >
                      {isLoading && (
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.5s_infinite]" />
                      )}
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-medium animate-pulse">{t("accountRequest.submitting")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Send className="size-4 rtl:rotate-180" />
                          <span>{t("accountRequest.submit")}</span>
                        </div>
                      )}
                    </Button>

                    <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-3">
                      <Link
                        href="/"
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                      >
                        <BackArrow className="size-3.5" /> {t("backToHome")}
                      </Link>
                      <div>
                        <span className="text-muted-foreground">{t("accountRequest.haveAccount")}</span>{" "}
                        <Link
                          href="/login"
                          className="font-semibold text-primary hover:underline"
                        >
                          {t("accountRequest.signIn")}
                        </Link>
                      </div>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
