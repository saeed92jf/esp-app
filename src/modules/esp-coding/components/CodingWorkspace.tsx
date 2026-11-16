"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Binary,
  Layers,
  Database,
  ShieldCheck,
  Search,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EspCodingClientService } from "../services/esp-coding.service";
import { CodingAuditLog, RegisteredProduct } from "../types";

export function CodingWorkspace() {
  const t = useTranslations("espCoding");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    productsCount: 0,
    materialsCount: 0,
    activeFormulasCount: 0,
    pendingApprovalsCount: 0,
  });
  const [recentProducts, setRecentProducts] = useState<RegisteredProduct[]>([]);
  const [recentLogs, setRecentLogs] = useState<CodingAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profData, prodData, matData, logsData] = await Promise.all([
          EspCodingClientService.getProfilesAndVersions().catch(() => ({ profiles: [], versions: [] })),
          EspCodingClientService.getProducts({ limit: 5 }).catch(() => ({ registered: [], reservations: [], catalog: { items: [], total: 0 } })),
          EspCodingClientService.getMaterials({ limit: 1 }).catch(() => ({ items: [], total: 0 })),
          EspCodingClientService.getAuditLogs().catch(() => ({ logs: [] })),
        ]);

        const activeFormulas = profData.versions.filter((v: any) => v.status === "active").length;
        const pendingApprovals = profData.versions.filter((v: any) => v.status === "pending_approval").length;

        setStats({
          productsCount: prodData.registered.length + (prodData.catalog?.total || 0),
          materialsCount: matData.total || 0,
          activeFormulasCount: activeFormulas,
          pendingApprovalsCount: pendingApprovals,
        });

        setRecentProducts(prodData.registered.slice(0, 5));
        setRecentLogs(logsData.logs.slice(0, 6));
      } catch (err) {
        console.error("Failed to load workspace data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
      {/* Hero Welcome / Primary Actions Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-border/50 rounded-2xl relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                <Sparkles className="size-3.5 me-1.5" />
                <span>{isRtl ? "مستر دیتا و مهندسی استاندارد" : "Master Data & Standard Engineering"}</span>
              </Badge>
              {stats.pendingApprovalsCount > 0 && (
                <Badge variant="destructive" className="px-2 py-0.5 text-xs font-mono">
                  {stats.pendingApprovalsCount} {isRtl ? "در صف تأیید سوپرادمین" : "Pending Super Admin Approval"}
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button asChild size="default" className="rounded-xl gap-2 font-bold shadow-xs">
              <Link href="/engineering/esp-coding/products">
                <PlusCircle className="size-4" />
                <span>{t("workspace.startNewCoding")}</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="default" className="rounded-xl gap-2 font-semibold">
              <Link href="/engineering/esp-coding/materials">
                <Database className="size-4" />
                <span>{t("workspace.exploreMaterials")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-xl border-border/50 bg-background/80 shadow-2xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">{t("workspace.totalProducts")}</span>
            <Binary className="size-4 text-primary" />
          </div>
          <span className="text-2xl font-black text-foreground fa-num">
            {stats.productsCount.toLocaleString(isRtl ? "fa-IR" : "en-US")}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {isRtl ? "۷,۲۱۷ قلم درخت تولید + ثبت‌شده‌ها" : "7,217 catalog + registered"}
          </span>
        </Card>

        <Card className="p-4 rounded-xl border-border/50 bg-background/80 shadow-2xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">{t("workspace.totalMaterials")}</span>
            <Database className="size-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-foreground fa-num">
            {stats.materialsCount.toLocaleString(isRtl ? "fa-IR" : "en-US")}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {isRtl ? "۱۶۵ ویژگی فنی و مکانیکی" : "165 technical properties"}
          </span>
        </Card>

        <Card className="p-4 rounded-xl border-border/50 bg-background/80 shadow-2xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">{t("workspace.activeFormulas")}</span>
            <Settings2 className="size-4 text-violet-500" />
          </div>
          <span className="text-2xl font-black text-foreground fa-num">
            {stats.activeFormulasCount}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {isRtl ? "پروفایل‌های رسمی فعال" : "Officially active profiles"}
          </span>
        </Card>

        <Card className="p-4 rounded-xl border-border/50 bg-background/80 shadow-2xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">{t("workspace.pendingApprovals")}</span>
            <ShieldCheck className="size-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-foreground fa-num">
            {stats.pendingApprovalsCount}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {isRtl ? "نیازمند تأیید سوپرادمین" : "Super Admin review required"}
          </span>
        </Card>
      </div>

      {/* Unified Fast Search Input */}
      <div className="relative w-full">
        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("workspace.searchPlaceholder")}
          className="ps-10 pe-4 h-11 bg-background border-border/60 rounded-xl text-xs sm:text-sm font-medium shadow-2xs"
        />
      </div>

      {/* Two Column Section: Quick Access Hubs & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Module Sub-Systems Directory */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <span>{isRtl ? "بخش‌های تخصصی سیستم کدگذاری" : "ESP Coding Sub-Systems"}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/engineering/esp-coding/products"
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col gap-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {t("nav.products")}
                </span>
                <Arrow className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {isRtl
                  ? "کدگذاری قطعات تولیدی، آبشاری دسته‌بندی و رزرو قطعی کد"
                  : "Production product classification cascades & permanent registration"}
              </p>
            </Link>

            <Link
              href="/engineering/esp-coding/materials"
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col gap-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {t("nav.materials")}
                </span>
                <Arrow className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {isRtl
                  ? "مستر دیتای متریال با تمام ۱۶۵ ویژگی مکانیکی، حرارتی و متالورژی"
                  : "1,396 master materials with 165 mechanical, thermal & metallurgical attributes"}
              </p>
            </Link>

            <Link
              href="/engineering/esp-coding/formula-designer"
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col gap-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {t("nav.formulaDesigner")}
                </span>
                <Arrow className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {isRtl
                  ? "طراحی بصری فرمول‌ها، چینش درگ‌اند‌دراپ و پیش‌نمایش زنده"
                  : "Visual drag-and-drop formula design, custom separators & live preview"}
              </p>
            </Link>

            <Link
              href="/engineering/esp-coding/approvals"
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col gap-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {t("nav.approvals")}
                </span>
                <Arrow className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {isRtl
                  ? "دروازه تأیید، فعال‌سازی رسمی و بازگردانی تحت نظارت سوپرادمین"
                  : "Super Admin governance gate, lifecycle approval & rollback"}
              </p>
            </Link>
          </div>
        </div>

        {/* System Audit Trail Snapshot */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <span>{t("workspace.recentAuditLogs")}</span>
            </h2>
            <Link
              href="/engineering/esp-coding/imports"
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>{isRtl ? "مشاهده تاریخچه کامل" : "Full History"}</span>
            </Link>
          </div>

          <Card className="p-3 rounded-2xl border-border/50 bg-background/60 shadow-xs flex flex-col divide-y divide-border/30">
            {recentLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                {isRtl ? "هیچ لاگ ممیزی ثبت نشده است." : "No audit records found."}
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="size-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-foreground truncate">
                        {isRtl ? log.detailsFa : log.detailsEn}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {log.userName} • {new Date(log.timestamp).toLocaleTimeString(isRtl ? "fa-IR" : "en-US")}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                    {log.action}
                  </Badge>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
