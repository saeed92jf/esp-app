"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "motion/react";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  LayoutDashboard, 
  UserCheck, 
  Layers, 
  Compass, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/hooks/use-auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";

export default function WelcomePage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const isFa = locale === "fa";
  const BackArrow = isFa ? ArrowRight : ArrowLeft;
  const { user } = useAuth();

  const userName = user?.fullName || (isFa ? "همکار گرامی" : "Valued Colleague");

  const features = [
    {
      icon: LayoutDashboard,
      title: isFa ? "میز کار و داشبورد یکپارچه" : "Integrated Dashboard",
      desc: isFa ? "دسترسی سریع به ابزارهای محاسباتی، نقشه‌ها و تسک‌های فعال" : "Quick access to calculation tools, drawings and active tasks",
    },
    {
      icon: Layers,
      title: isFa ? "گردش کار هوشمند ESP-Flow" : "ESP-Flow Workflow",
      desc: isFa ? "پیگیری و تأیید مدارک فنی، مهندسی و زنجیره تأمین" : "Track and approve engineering documents and technical requests",
    },
    {
      icon: ShieldCheck,
      title: isFa ? "امنیت و پرونده پرسنلی" : "Profile & Credentials",
      desc: isFa ? "مدیریت دسترسی‌ها، نقش‌ها و اطلاعات احراز هویت شرکتی" : "Manage access levels, corporate roles and personal credentials",
    },
  ];

  return (
    <div className="w-full flex-1 min-h-[var(--home-height)] max-h-[var(--home-height)] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar bg-transparent">
      <Card className="w-full max-w-[540px] shadow-2xl border-border/50 bg-card/90 dark:bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 my-auto shrink-0 transition-all relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full blur-3xl opacity-35 bg-gradient-to-b from-primary/30 to-indigo-500/10" />

        {/* Header */}
        <CardHeader className="space-y-3 text-center p-0 pb-6">
          <div className="flex justify-center mb-1">
            <div className="bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20 shadow-xs">
              <Logo className="text-xs sm:text-sm" showText={false} />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
              <Sparkles className="size-3.5" />
              <span>{isFa ? "ورود به اکوسیستم سازمانی" : "Welcome Onboard"}</span>
            </div>
            <CardTitle className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-foreground">
              {isFa ? `خوش آمدید، ${userName}` : `Welcome, ${userName}`}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {isFa
                ? "حساب کاربری شما آماده بهره‌برداری از ماژول‌های مهندسی، صنعتی و عملیاتی یورو اسلات پارس است."
                : "Your account is ready to access engineering, industrial and operational modules."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-6">
          {/* Feature Highlights Grid */}
          <div className="space-y-2.5">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                  className="flex items-start gap-3.5 p-3 rounded-2xl bg-muted/40 border border-border/50 text-foreground"
                >
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Icon className="size-4.5" />
                  </div>
                  <div className="space-y-0.5 text-right rtl:text-right ltr:text-left">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      {feat.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <Button asChild className="w-full h-11 sm:h-12 rounded-xl text-sm sm:text-base font-semibold shadow-md shadow-primary/20">
              <Link href="/dashboard" className="flex items-center justify-center gap-2">
                <LayoutDashboard className="size-4.5" />
                <span>{isFa ? "ورود به میز کار (داشبورد)" : "Go to Dashboard"}</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full h-11 rounded-xl text-xs sm:text-sm font-medium border-border/60 hover:bg-muted/50">
              <Link href="/profile" className="flex items-center justify-center gap-2">
                <UserCheck className="size-4" />
                <span>{isFa ? "مشاهده و ویرایش مشخصات پرسنلی" : "View Personnel Profile"}</span>
              </Link>
            </Button>
          </div>

          {/* Bottom Link */}
          <div className="pt-2 border-t border-border/40 text-center">
            <Link
              href="/"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 font-medium"
            >
              <BackArrow className="size-3.5" /> {t("backToHome")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
