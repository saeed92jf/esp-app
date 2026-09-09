"use client";

import { useEffect, useState, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import { useRouter, Link } from "@/i18n/navigation";
import { api } from "@/services";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";

function VerifyEmailContent() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg(t("verifyEmailFailed"));
      return;
    }

    const verify = async () => {
      try {
        await api.auth.verifyEmail(token);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err?.message || t("verifyEmailFailed"));
      }
    };

    verify();
  }, [token, t]);

  return (
    <Card className="w-full max-w-md shadow-xl border-border/50">
      <CardHeader className="space-y-4 text-center pb-6">
        <div className="flex justify-center mb-2">
          <Logo className="text-3xl" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t("verifyEmailTitle")}</CardTitle>
          <CardDescription className="text-sm">
            {status === "loading" && t("verifyEmailLoading")}
            {status === "success" && <span className="text-emerald-500">{t("verifyEmailSuccess")}</span>}
            {status === "error" && <span className="text-destructive">{errorMsg}</span>}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center space-y-6 pb-6">
        {status === "loading" && (
          <Loader2 className="size-12 animate-spin text-primary" />
        )}
        
        {status === "success" && (
          <CheckCircle2 className="size-16 text-emerald-500" />
        )}

        {status === "error" && (
          <XCircle className="size-16 text-destructive" />
        )}

        {status !== "loading" && (
          <Button asChild className="w-full h-11 text-base mt-4">
            <Link href="/login">
              {t("backToLogin")}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Suspense fallback={<div className="flex justify-center"><Loader2 className="size-8 animate-spin" /></div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
