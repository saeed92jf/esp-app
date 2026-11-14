"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  Zap,
  Server,
  Globe,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Terminal,
  Copy,
  Check,
  Sliders,
  Database,
  Layers,
  LayoutGrid,
  CheckSquare,
  Activity,
  Send,
  Eye,
  EyeOff,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ApiTestResult {
  status: "idle" | "loading" | "success" | "error";
  statusCode?: number;
  durationMs?: number;
  data?: unknown;
  error?: string;
}

export function TestLabView() {
  const locale = useLocale();
  const isFa = locale === "fa";
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Interactive state
  const [activeTab, setActiveTab] = useState<string>("components");
  const [counter, setCounter] = useState<number>(0);
  const [switchEnabled, setSwitchEnabled] = useState<boolean>(true);
  const [sampleInputText, setSampleInputText] = useState<string>("Euroslot Pars CORE");
  const [sampleNumber, setSampleNumber] = useState<number>(1404);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Client environment inspection state
  const [mounted, setMounted] = useState<boolean>(false);
  const [clientEnv, setClientEnv] = useState<{
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    renderTime: string;
  } | null>(null);

  // API Ping Test state
  const [apiResult, setApiResult] = useState<ApiTestResult>({ status: "idle" });

  useEffect(() => {
    setMounted(true);
    setClientEnv({
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "SSR",
      screenWidth: typeof window !== "undefined" ? window.innerWidth : 0,
      screenHeight: typeof window !== "undefined" ? window.innerHeight : 0,
      renderTime: new Date().toLocaleTimeString(isFa ? "fa-IR" : "en-US"),
    });
  }, [isFa]);

  const copyToClipboard = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(isFa ? "در کلیپ‌بورد کپی شد" : "Copied to clipboard");
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleTestApi = async (endpoint: string = "/api/dashboard") => {
    setApiResult({ status: "loading" });
    const startTime = performance.now();
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const durationMs = Math.round(performance.now() - startTime);
      let data: unknown;
      try {
        data = await res.json();
      } catch {
        data = { message: "Non-JSON response or empty body" };
      }

      setApiResult({
        status: res.ok ? "success" : "error",
        statusCode: res.status,
        durationMs,
        data,
      });

      if (res.ok) {
        toast.success(
          isFa
            ? `پاسخ API دریافت شد (${durationMs}ms - کد ${res.status})`
            : `API responded (${durationMs}ms - Code ${res.status})`
        );
      } else {
        toast.warning(
          isFa
            ? `API وضعیت ناموفق بازگرداند (${res.status})`
            : `API returned status ${res.status}`
        );
      }
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);
      const errMsg = err instanceof Error ? err.message : String(err);
      setApiResult({
        status: "error",
        durationMs,
        error: errMsg,
      });
      toast.error(isFa ? `خطا در ارتباط با API: ${errMsg}` : `API connection error: ${errMsg}`);
    }
  };

  const ArrowIcon = isFa ? ArrowLeft : ArrowRight;

  return (
    <div className="relative min-h-full flex-1 flex flex-col overflow-hidden bg-background">
      {/* Background radial aura */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[45%] w-[45%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[45%] w-[45%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 py-10 md:py-16 max-w-6xl z-10 space-y-10">
        {/* Header Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/60"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 text-xs font-semibold">
              <FlaskConical className="size-3.5" />
              <span>{isFa ? "صفحه آزمایشگاه و تست سیستم" : "System Test Lab & Sandbox"}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <span>{isFa ? "آزمایشگاه توسعه و اعتبارسنجی" : "Development & Verification Lab"}</span>
              <Sparkles className="size-7 text-primary animate-pulse hidden sm:inline-block" />
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {isFa
                ? "صفحه تست اختصاصی جهت اعتبارسنجی کامپوننت‌های رابط کاربری، رفتار چندزبانه (i18n)، اعداد فارسی، تم‌های روشن/تاریک و سلامت ارتباطات شبکه."
                : "Dedicated sandbox to validate UI components, i18n behavior, Persian numerals, theme tokens, and network health across Euroslot Pars CORE."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/">
                <span>{isFa ? "بازگشت به خانه" : "Back to Home"}</span>
                <ArrowIcon className="size-4" />
              </Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                toast.success(
                  isFa ? "تست موفقیت‌آمیز اعلان‌ها در سیستم!" : "Notification trigger verified!"
                );
              }}
              className="gap-1.5"
            >
              <Zap className="size-4" />
              <span>{isFa ? "تست اعلان فوری" : "Quick Toast"}</span>
            </Button>
          </div>
        </motion.div>

        {/* Feature & Tech Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono">Next.js 15.x</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <span className="font-mono">React 19</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <span className="font-mono">TypeScript 5</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <span className="font-mono">Tailwind CSS 4</span>
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <Globe className="size-3" />
            <span>{isFa ? "زبان: فارسی (RTL)" : "Locale: English (LTR)"}</span>
          </Badge>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 gap-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="components" className="gap-2 py-2.5">
              <LayoutGrid className="size-4" />
              <span>{isFa ? "کامپوننت‌های UI" : "UI Components"}</span>
            </TabsTrigger>
            <TabsTrigger value="persian-i18n" className="gap-2 py-2.5">
              <Globe className="size-4" />
              <span>{isFa ? "اعداد و خط فارسی" : "Persian & i18n"}</span>
            </TabsTrigger>
            <TabsTrigger value="tokens" className="gap-2 py-2.5">
              <Sliders className="size-4" />
              <span>{isFa ? "سیستم تم و رنگ" : "Theme & Tokens"}</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="gap-2 py-2.5">
              <Server className="size-4" />
              <span>{isFa ? "سلامت و تست API" : "API & Health"}</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: UI COMPONENTS */}
          <TabsContent value="components" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buttons Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckSquare className="size-4 text-primary" />
                    <span>{isFa ? "انواع دکمه‌ها (Buttons)" : "Button Variants & Sizes"}</span>
                  </CardTitle>
                  <CardDescription>
                    {isFa
                      ? "بررسی واریانت‌های دکمه در تم و حالات مختلف کلیک"
                      : "Preview button variants, states, and sizing rules"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="default">{isFa ? "اصلی (Default)" : "Default"}</Button>
                    <Button variant="secondary">{isFa ? "ثانویه (Secondary)" : "Secondary"}</Button>
                    <Button variant="outline">{isFa ? "حاشیه‌دار (Outline)" : "Outline"}</Button>
                    <Button variant="ghost">{isFa ? "بی‌رنگ (Ghost)" : "Ghost"}</Button>
                    <Button variant="destructive">{isFa ? "حذف (Destructive)" : "Destructive"}</Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                    <Button size="xs" variant="outline">Size XS</Button>
                    <Button size="sm" variant="outline">Size SM</Button>
                    <Button size="default" variant="outline">Default Size</Button>
                    <Button size="lg" variant="outline">Size LG</Button>
                    <Button size="icon" variant="outline" aria-label="Icon button">
                      <Zap className="size-4 text-primary" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Inputs & Form Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Terminal className="size-4 text-primary" />
                    <span>{isFa ? "ورودی‌ها و فیلدهای فرم" : "Inputs & Number Stepper"}</span>
                  </CardTitle>
                  <CardDescription>
                    {isFa
                      ? "تست ورودی‌های متنی و فیلد عدد اختصاصی با کنترلرهای افزایش/کاهش"
                      : "Standard text inputs and stepper controls with hold support"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {isFa ? "ورودی متن استاندارد" : "Standard Text Input"}
                    </label>
                    <Input
                      value={sampleInputText}
                      onChange={(e) => setSampleInputText(e.target.value)}
                      placeholder={isFa ? "یک متن دلخواه وارد کنید..." : "Enter text here..."}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {isFa ? "ورودی عدد (همراه با کلیدهای بالا/پایین)" : "Number Input (with Stepper)"}
                    </label>
                    <Input
                      type="number"
                      step={1}
                      value={sampleNumber}
                      onChange={(e) => setSampleNumber(Number(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Switches & Interactive State */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sliders className="size-4 text-primary" />
                    <span>{isFa ? "سوییچ‌ها و متغیرهای فعال‌سازی" : "Switches & Reactivity"}</span>
                  </CardTitle>
                  <CardDescription>
                    {isFa
                      ? "بررسی سوییچ با انیمیشن جهت‌دار در زبان‌های راست‌به‌چپ و چپ‌به‌راست"
                      : "Direction-aware thumb transitions in RTL and LTR"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {isFa ? "وضعیت ماژول آزمایشی" : "Experimental Module State"}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {switchEnabled
                          ? isFa ? "ماژول فعال است" : "Module is active"
                          : isFa ? "ماژول غیرفعال است" : "Module is disabled"}
                      </p>
                    </div>
                    <Switch checked={switchEnabled} onCheckedChange={setSwitchEnabled} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {isFa ? "شمارنده تعاملی ری‌اکت" : "Interactive React Counter"}
                      </span>
                      <p className="text-xs text-muted-foreground font-mono">
                        {isFa ? "مقدار فعلی: " : "Current: "}{counter}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setCounter((c) => c - 1)}>
                        -1
                      </Button>
                      <Button size="sm" variant="default" onClick={() => setCounter((c) => c + 1)}>
                        +1
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setCounter(0)}>
                        {isFa ? "بازنشانی" : "Reset"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sonner Toasts Trigger */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="size-4 text-primary" />
                    <span>{isFa ? "تست سیستم اعلان‌ها (Toast / Sonner)" : "Notification & Toaster"}</span>
                  </CardTitle>
                  <CardDescription>
                    {isFa
                      ? "تست ارسال اعلان‌های همگانی در انواع مختلف موفقیت، هشدار، خطا و اطلاع‌رسانی"
                      : "Trigger all notification types with custom descriptions"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5"
                      onClick={() =>
                        toast.success(
                          isFa ? "عملیات با موفقیت انجام شد!" : "Operation completed successfully!",
                          { description: isFa ? "داده‌ها در سرور ثبت گردیدند." : "Payload saved to the database." }
                        )
                      }
                    >
                      <CheckCircle2 className="size-4" />
                      <span>{isFa ? "اعلان موفقیت" : "Success Toast"}</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5"
                      onClick={() =>
                        toast.warning(
                          isFa ? "هشدار: بررسی مجدد نیاز است" : "Warning: Review Required",
                          { description: isFa ? "لطفاً موارد امنیتی را رعایت کنید." : "Check configuration parameters." }
                        )
                      }
                    >
                      <AlertTriangle className="size-4" />
                      <span>{isFa ? "اعلان هشدار" : "Warning Toast"}</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 gap-1.5"
                      onClick={() =>
                        toast.error(
                          isFa ? "خطا در پردازش درخواست" : "Request Processing Error",
                          { description: isFa ? "کد خطا: ERR_TEST_SIMULATION" : "Error code: ERR_TEST_SIMULATION" }
                        )
                      }
                    >
                      <AlertCircle className="size-4" />
                      <span>{isFa ? "اعلان خطا" : "Error Toast"}</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="border-primary/30 hover:bg-primary/10 text-primary gap-1.5"
                      onClick={() =>
                        toast.info(
                          isFa ? "اطلاعیه جدید سیستم" : "System Notification",
                          { description: isFa ? "نسخه جدید سیستم فعال است." : "New version active." }
                        )
                      }
                    >
                      <Info className="size-4" />
                      <span>{isFa ? "اعلان اطلاعات" : "Info Toast"}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: PERSIAN DIGITS & i18n */}
          <TabsContent value="persian-i18n" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Persian Digits Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    <span>{isFa ? "آزمون تبدیل ارقام به فارسی (.fa-num)" : "Persian Numerals Conversion"}</span>
                  </CardTitle>
                  <CardDescription>
                    {isFa
                      ? "بررسی عملکرد PersianDigitsProvider و کلاس .fa-num در صفحه"
                      : "Checking automated Persian digit translation rules"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                    <span className="text-xs text-muted-foreground font-semibold">
                      {isFa ? "ارقام انگلیسی استاندارد (بدون کلاس):" : "Raw English Digits (No Class):"}
                    </span>
                    <div className="text-2xl font-bold tracking-wider font-mono">
                      0123456789 - 1404/08/24
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                    <span className="text-xs text-primary font-semibold">
                      {isFa ? "ارقام با اعمال کلاس (.fa-num / .persian-digits):" : "Rendered with .fa-num class:"}
                    </span>
                    <div className="text-2xl font-bold tracking-wider fa-num text-primary">
                      0123456789 - 1404/08/24
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    {isFa
                      ? "نکته: در صورتی که زبان جاری فارسی باشد، کدهای داخل تگ‌های با کلاس .fa-num به صورت خودکار به خط و اعداد فارسی نگاشت می‌شوند."
                      : "Note: When Persian locale is active, DOM elements with class .fa-num automatically convert Arabic-indic numerals."}
                  </div>
                </CardContent>
              </Card>

              {/* Currency & RTL Layout */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    <span>{isFa ? "فرمت مبالغ مالی و جهت چیدمان (RTL / LTR)" : "Currencies & Bi-directional Layout"}</span>
                  </CardTitle>
                  <CardDescription>
                    {isFa
                      ? "تست قرارگیری صحیح پیشوندها و پسوندهای ارزی در حالت‌های مختلف"
                      : "Validation of currency symbols, deltas, and spacing in RTL/LTR"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      {isFa ? "مبلغ به ریال/تومان:" : "Rial/Toman Currency:"}
                    </span>
                    <div className="flex items-baseline gap-1.5 fa-num" dir={isFa ? "rtl" : "ltr"}>
                      <span className="text-xl font-bold text-foreground">125,400,000</span>
                      <span className="text-xs text-muted-foreground">{isFa ? "تومان" : "TOMAN"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      {isFa ? "مبلغ بین‌المللی دلاری:" : "USD Global Currency:"}
                    </span>
                    <div className="flex items-baseline gap-1.5" dir="ltr">
                      <span className="text-xl font-bold text-foreground">$4,850.25</span>
                      <span className="text-xs text-muted-foreground">USD</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      {isFa ? "نرخ رشد / نوسان:" : "Percentage Delta:"}
                    </span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 fa-num font-mono">
                      +14.85%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: THEME & DESIGN TOKENS */}
          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <span>{isFa ? "پالت متغیرهای رنگی (Tailwind CSS 4 OKLCH Variables)" : "Design System Color Tokens"}</span>
                </CardTitle>
                <CardDescription>
                  {isFa
                    ? "توکن‌های استاندارد طراحی پروژه شامل Primary، Card، Muted، Accent و Destructive"
                    : "Core CSS variables dynamically adapting between Light and Dark mode"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="space-y-2 text-center">
                    <div className="h-16 rounded-xl bg-primary shadow-sm ring-1 ring-border/20 flex items-center justify-center text-primary-foreground font-semibold text-xs">
                      Primary
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground block">var(--primary)</span>
                  </div>

                  <div className="space-y-2 text-center">
                    <div className="h-16 rounded-xl bg-secondary shadow-sm ring-1 ring-border/20 flex items-center justify-center text-secondary-foreground font-semibold text-xs">
                      Secondary
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground block">var(--secondary)</span>
                  </div>

                  <div className="space-y-2 text-center">
                    <div className="h-16 rounded-xl bg-card shadow-sm ring-1 ring-border/40 flex items-center justify-center text-card-foreground font-semibold text-xs">
                      Card
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground block">var(--card)</span>
                  </div>

                  <div className="space-y-2 text-center">
                    <div className="h-16 rounded-xl bg-muted shadow-sm ring-1 ring-border/20 flex items-center justify-center text-muted-foreground font-semibold text-xs">
                      Muted
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground block">var(--muted)</span>
                  </div>

                  <div className="space-y-2 text-center">
                    <div className="h-16 rounded-xl bg-accent shadow-sm ring-1 ring-border/20 flex items-center justify-center text-accent-foreground font-semibold text-xs">
                      Accent
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground block">var(--accent)</span>
                  </div>

                  <div className="space-y-2 text-center">
                    <div className="h-16 rounded-xl bg-destructive/15 shadow-sm ring-1 ring-destructive/30 flex items-center justify-center text-destructive font-semibold text-xs">
                      Destructive
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground block">var(--destructive)</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-foreground">
                      {isFa ? "حالت فعلی پوسته (Theme Mode):" : "Current Active Theme:"}
                    </span>
                    <p className="text-xs text-muted-foreground font-mono">
                      {mounted ? (resolvedTheme || theme || "system") : "..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={resolvedTheme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                    >
                      {isFa ? "حالت روشن" : "Light Mode"}
                    </Button>
                    <Button
                      size="sm"
                      variant={resolvedTheme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                    >
                      {isFa ? "حالت تاریک" : "Dark Mode"}
                    </Button>
                    <Button
                      size="sm"
                      variant={theme === "system" ? "secondary" : "ghost"}
                      onClick={() => setTheme("system")}
                    >
                      {isFa ? "سیستم" : "System"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: API & SYSTEM DIAGNOSTICS */}
          <TabsContent value="diagnostics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API Connectivity Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="size-4 text-primary" />
                    <span>{isFa ? "تست برقراری ارتباط با API سرور" : "API Connectivity Ping"}</span>
                  </CardTitle>
                  <CardDescription>
                    {isFa
                      ? "ارسال درخواست آزمایشی GET به اندپوینت‌های داخلی پروژه و اندازه‌گیری زمان پاسخ"
                      : "Sends test HTTP GET requests to measure response time and payload status"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTestApi("/api/dashboard")}
                      disabled={apiResult.status === "loading"}
                      className="gap-1.5"
                    >
                      {apiResult.status === "loading" ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      <span>{isFa ? "تست /api/dashboard" : "Ping /api/dashboard"}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestApi("/api/users/me")}
                      disabled={apiResult.status === "loading"}
                      className="gap-1.5"
                    >
                      {apiResult.status === "loading" ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      <span>{isFa ? "تست /api/users/me" : "Ping /api/users/me"}</span>
                    </Button>
                  </div>

                  {apiResult.status !== "idle" && (
                    <div className="rounded-xl bg-card border border-border/60 p-4 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{isFa ? "وضعیت پاسخ:" : "Status:"}</span>
                        <Badge
                          variant={apiResult.status === "success" ? "default" : "destructive"}
                          className="font-mono text-xs"
                        >
                          {apiResult.statusCode ? `HTTP ${apiResult.statusCode}` : apiResult.status}
                        </Badge>
                      </div>

                      {apiResult.durationMs !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{isFa ? "زمان تاخیر (Latency):" : "Latency:"}</span>
                          <span className="text-foreground">{apiResult.durationMs} ms</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-muted-foreground">{isFa ? "پیش‌نمایش داده:" : "Payload Preview:"}</span>
                        <pre className="max-h-40 overflow-auto p-2 rounded-lg bg-muted/60 text-[11px] leading-relaxed text-foreground select-all">
                          {JSON.stringify(apiResult.data || apiResult.error, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Client Runtime Diagnostics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code2 className="size-4 text-primary" />
                    <span>{isFa ? "مشخصات محیط کلاینت (Runtime Diagnostics)" : "Client Runtime Environment"}</span>
                  </CardTitle>
                  <CardDescription>
                    {isFa
                      ? "اطلاعات ابعاد صفحه، جهت، زبان فعال و زمان رندرینگ"
                      : "Screen dimensions, locale direction, and hydration timestamp"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground">{isFa ? "زبان فعال (Locale):" : "Current Locale:"}</span>
                    <Badge variant="outline" className="font-mono">{locale}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground">{isFa ? "جهت متن (Direction):" : "Text Direction:"}</span>
                    <span className="font-mono font-semibold">{isFa ? "rtl (راست به چپ)" : "ltr (Left to Right)"}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground">{isFa ? "ابعاد صفحه (Viewport):" : "Screen Viewport:"}</span>
                    <span className="font-mono font-semibold">
                      {mounted && clientEnv ? `${clientEnv.screenWidth} × ${clientEnv.screenHeight} px` : "..."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground">{isFa ? "زمان هایدریشن کلاینت:" : "Client Hydration:"}</span>
                    <span className="font-mono text-muted-foreground">
                      {mounted && clientEnv ? clientEnv.renderTime : "..."}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-semibold">{isFa ? "مشخصات مرورگر (User Agent):" : "User Agent:"}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6"
                        onClick={() => copyToClipboard(clientEnv?.userAgent || "", "ua")}
                      >
                        {copiedKey === "ua" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      </Button>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground break-all line-clamp-2">
                      {mounted && clientEnv ? clientEnv.userAgent : "..."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
