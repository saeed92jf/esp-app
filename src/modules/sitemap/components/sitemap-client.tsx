// src/modules/sitemap/components/sitemap-client.tsx
"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Terminal,
  FolderTree,
  ListFilter,
  FileCode2,
  Copy,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Radio,
  Server,
  ChevronDown,
  Layers,
  Send,
  AlertTriangle,
  Code2,
  FileJson,
  Sparkles,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getProjectSitemapRoutes,
  type SitemapRouteItem,
  type RouteCategory,
  type RouteAccess,
} from "../config/sitemap-routes";
import {
  SYSTEM_API_CONTRACTS,
  STANDARD_RESPONSE_ENVELOPE,
  API_ARCHITECTURE_OVERVIEW,
  getApiArchitectureStats,
  type ApiEndpointContract,
  type ApiMethod,
  type ApiDomain,
  type ApiImplementationType,
} from "../config/sitemap-api-contracts";

type ViewMode = "tree" | "table" | "json" | "api";
type AccessFilter = "all" | RouteAccess;

export function SitemapClient() {
  const t = useTranslations("Sitemap");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedCurlId, setCopiedCurlId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // API mode filters
  const [apiDomainFilter, setApiDomainFilter] = useState<string>("all");
  const [apiMethodFilter, setApiMethodFilter] = useState<string>("all");
  const [apiImplFilter, setApiImplFilter] = useState<string>("all");
  const [showArchGuide, setShowArchGuide] = useState(true);
  const [expandedApiIds, setExpandedApiIds] = useState<Record<string, boolean>>({
    "projects-create": true,
    "tasks-create": true,
    "telemetry-exchange-rates": true,
  });
  const [showEnvelope, setShowEnvelope] = useState(false);

  // Dynamic API Architecture Metrics (always in sync with SYSTEM_API_CONTRACTS)
  const apiStats = useMemo(() => getApiArchitectureStats(SYSTEM_API_CONTRACTS), []);

  // Dynamically resolved project routes
  const allRoutes = useMemo(() => getProjectSitemapRoutes(), []);

  // Filtered routes based on search and access tier
  const filteredRoutes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allRoutes.filter((route) => {
      if (accessFilter !== "all" && route.access !== accessFilter) {
        return false;
      }
      if (activeCategory !== "all" && route.category !== activeCategory) {
        return false;
      }
      if (!q) return true;

      return (
        route.path.toLowerCase().includes(q) ||
        route.titleEn.toLowerCase().includes(q) ||
        route.titleFa.toLowerCase().includes(q) ||
        route.descEn.toLowerCase().includes(q) ||
        route.descFa.toLowerCase().includes(q) ||
        route.category.toLowerCase().includes(q) ||
        route.access.toLowerCase().includes(q)
      );
    });
  }, [allRoutes, accessFilter, activeCategory, searchQuery]);

  // Filtered API Contracts
  const filteredApis = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return SYSTEM_API_CONTRACTS.filter((api) => {
      if (apiDomainFilter !== "all" && api.domain !== apiDomainFilter) {
        return false;
      }
      if (apiMethodFilter !== "all" && api.method !== apiMethodFilter) {
        return false;
      }
      if (apiImplFilter !== "all" && api.implementationType !== apiImplFilter) {
        return false;
      }
      if (!q) return true;

      return (
        api.path.toLowerCase().includes(q) ||
        api.method.toLowerCase().includes(q) ||
        api.titleEn.toLowerCase().includes(q) ||
        api.titleFa.toLowerCase().includes(q) ||
        api.descriptionEn.toLowerCase().includes(q) ||
        api.descriptionFa.toLowerCase().includes(q) ||
        api.stageEn.toLowerCase().includes(q) ||
        api.stageFa.toLowerCase().includes(q) ||
        (api.serverHandlerPath && api.serverHandlerPath.toLowerCase().includes(q)) ||
        (api.clientServicePath && api.clientServicePath.toLowerCase().includes(q)) ||
        api.errorScenarios.some(
          (err) =>
            err.code.toLowerCase().includes(q) ||
            err.descriptionEn.toLowerCase().includes(q) ||
            err.descriptionFa.toLowerCase().includes(q)
        )
      );
    });
  }, [apiDomainFilter, apiMethodFilter, apiImplFilter, searchQuery]);

  // Group routes by category for hierarchical tree rendering
  const groupedRoutes = useMemo(() => {
    const groups: Record<RouteCategory, SitemapRouteItem[]> = {
      core: [],
      engineering: [],
      projectManagement: [],
      knowledge: [],
      admin: [],
      auth: [],
      legal: [],
    };

    filteredRoutes.forEach((route) => {
      if (groups[route.category]) {
        groups[route.category].push(route);
      }
    });

    return groups;
  }, [filteredRoutes]);

  const toggleApiExpand = (id: string) => {
    setExpandedApiIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Copy to clipboard handler
  const handleCopy = async () => {
    try {
      if (viewMode === "json") {
        await navigator.clipboard.writeText(
          JSON.stringify(filteredRoutes, null, 2)
        );
      } else if (viewMode === "api") {
        await navigator.clipboard.writeText(
          JSON.stringify(
            {
              openapi: "3.0.0",
              info: {
                title: "Euroslot Pars CORE API Contracts",
                version: "1.0.0",
              },
              standardEnvelope: STANDARD_RESPONSE_ENVELOPE,
              endpoints: filteredApis,
            },
            null,
            2
          )
        );
      } else {
        const textTree = filteredRoutes
          .map(
            (r) =>
              `[${r.access.toUpperCase()}] ${r.path} -> ${
                locale === "fa" ? r.titleFa : r.titleEn
              } (${r.status})`
          )
          .join("\n");
        await navigator.clipboard.writeText(textTree);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy sitemap:", err);
    }
  };

  const handleCopyCurl = async (api: ApiEndpointContract) => {
    const curl = [
      `curl -X ${api.method} "https://api.esp-core.ir${api.path}"`,
      `  -H "Authorization: Bearer <your_access_token>"`,
      api.requestBody ? `  -H "Content-Type: application/json"` : "",
      api.requestBody
        ? `  -d '${JSON.stringify(api.requestBody.samplePayload, null, 2)}'`
        : "",
    ]
      .filter(Boolean)
      .join(" \\\n");

    try {
      await navigator.clipboard.writeText(curl);
      setCopiedCurlId(api.id);
      setTimeout(() => setCopiedCurlId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const getMethodBadgeClass = (method: ApiMethod) => {
    switch (method) {
      case "GET":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
      case "POST":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "PUT":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case "PATCH":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30";
      case "DELETE":
        return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
    }
  };

  const getImplBadgeClass = (impl: ApiImplementationType) => {
    switch (impl) {
      case "real":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "dual":
        return "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30";
      case "fake":
      default:
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* ── Top Banner / Hero Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Terminal className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {t("pageTitle")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Live Network & Protocol Pill */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/70 text-xs font-mono text-muted-foreground shadow-2xs">
            <Radio className="size-3 text-emerald-500 animate-pulse" />
            <span>{t("protocol")}</span>
            <span className="text-border">|</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {t("systemStatus")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Terminal Shell (Theme Adaptive: Light in Light Mode, Sleek Dark in Dark Mode) ── */}
      <div className="w-full rounded-2xl border border-border/70 bg-card text-card-foreground dark:bg-[#0c0f17] dark:border-border/40 shadow-xl overflow-hidden font-mono transition-colors">
        {/* Terminal Title Bar / Window Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-muted/60 dark:bg-[#090c13] border-b border-border/70 dark:border-border/50">
          {/* Mac-style Window Controls */}
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ms-2 text-xs text-muted-foreground font-mono hidden sm:inline-block">
              {t("terminalHeader")}
            </span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/70 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                viewMode === "tree"
                  ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <FolderTree className="size-3.5" />
              <span className="font-sans text-xs">{t("viewTree")}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <ListFilter className="size-3.5" />
              <span className="font-sans text-xs">{t("viewTable")}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("json")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                viewMode === "json"
                  ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <FileCode2 className="size-3.5" />
              <span className="font-sans text-xs">{t("viewJson")}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("api")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                viewMode === "api"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Server className="size-3.5 text-emerald-500" />
              <span className="font-sans text-xs">{t("viewApi")}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                REST
              </span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background border border-border/70 hover:bg-muted text-foreground text-xs font-sans transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {t("copied")}
                </span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-muted-foreground" />
                <span>
                  {viewMode === "json"
                    ? t("copyJson")
                    : viewMode === "api"
                    ? t("exportOpenApi")
                    : t("copyTree")}
                </span>
              </>
            )}
          </button>
        </div>

        {/* ── Command Prompt & Interactive Search Toolbar ── */}
        <div className="p-4 sm:p-5 bg-muted/20 border-b border-border/60 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Live Command Prompt */}
            <div
              className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-1 overflow-hidden"
              dir="ltr"
            >
              <span className="text-primary font-bold">esp@root</span>
              <span className="text-muted-foreground/50">:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                {viewMode === "api" ? "/sys/api-contracts" : "/sys/routes"}
              </span>
              <span className="text-muted-foreground/60">$</span>
              <span className="text-foreground truncate font-medium">
                {viewMode === "api"
                  ? "cat contracts.json --filter=live"
                  : `tree --format=${viewMode} --live`}
              </span>
            </div>

            {/* Grep / Search Input */}
            <div className="relative min-w-[260px] sm:min-w-[320px]" dir="ltr">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  viewMode === "api"
                    ? t("searchApiPlaceholder")
                    : t("searchPlaceholder")
                }
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-background border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* ── Sub-Filter Chips ── */}
          {viewMode === "api" ? (
            /* API Implementation, Domain and Method Filters */
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              {/* Implementation Type Filter (Fake vs Real) */}
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                {t("filterByImpl")}:
              </span>
              {[
                { id: "all", label: t("implAll") },
                { id: "real", label: t("implReal") },
                { id: "dual", label: t("implDual") },
                { id: "fake", label: t("implFake") },
              ].map((imp) => (
                <button
                  key={imp.id}
                  type="button"
                  onClick={() => setApiImplFilter(imp.id)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer font-sans text-xs flex items-center gap-1.5",
                    apiImplFilter === imp.id
                      ? imp.id === "real"
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 font-bold shadow-2xs"
                        : imp.id === "dual"
                        ? "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/50 font-bold shadow-2xs"
                        : imp.id === "fake"
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50 font-bold shadow-2xs"
                        : "bg-primary/15 text-primary border-primary/40 font-semibold shadow-2xs"
                      : "bg-muted/40 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {imp.id === "real" && <span className="size-1.5 rounded-full bg-emerald-500" />}
                  {imp.id === "dual" && <span className="size-1.5 rounded-full bg-violet-500" />}
                  {imp.id === "fake" && <span className="size-1.5 rounded-full bg-amber-500" />}
                  <span>{imp.label}</span>
                </button>
              ))}

              <div className="h-3 w-px bg-border mx-1 hidden sm:block" />

              {/* Domain Filter */}
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                {t("filterByDomain")}:
              </span>
              {(
                [
                  "all",
                  "projects",
                  "tasks",
                  "telemetry",
                  "vdis",
                  "risks",
                  "auth",
                  "admin",
                ] as (ApiDomain | "all")[]
              ).map((dom) => (
                <button
                  key={dom}
                  type="button"
                  onClick={() => setApiDomainFilter(dom)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer font-sans text-xs",
                    apiDomainFilter === dom
                      ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                      : "bg-muted/40 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {dom === "all" ? t("allFilter") : dom.toUpperCase()}
                </button>
              ))}

              <div className="h-3 w-px bg-border mx-1 hidden sm:block" />

              {/* Method Filter */}
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                {t("filterByMethod")}:
              </span>
              {["all", "GET", "POST", "PUT", "DELETE"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setApiMethodFilter(m)}
                  className={cn(
                    "px-2 py-0.5 rounded-md border font-mono text-xs transition-colors cursor-pointer",
                    apiMethodFilter === m
                      ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/40 font-bold"
                      : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          ) : (
            /* Sitemap Route Access & Category Filters */
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                {t("routeAccess")}:
              </span>
              {(["all", "public", "auth", "admin"] as AccessFilter[]).map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setAccessFilter(filter)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer font-sans text-xs",
                      accessFilter === filter
                        ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                        : "bg-muted/40 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    {filter === "all" ? t("allFilter") : t(filter)}
                  </button>
                )
              )}

              <div className="h-3 w-px bg-border mx-1 hidden sm:block" />

              <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold ms-1">
                {t("routeCategory")}:
              </span>
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer font-sans text-xs",
                  activeCategory === "all"
                    ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/40 font-semibold"
                    : "bg-muted/40 text-muted-foreground border-border hover:border-cyan-500/30 hover:text-foreground"
                )}
              >
                {t("allFilter")}
              </button>
              {(
                [
                  "core",
                  "engineering",
                  "projectManagement",
                  "knowledge",
                  "admin",
                  "legal",
                ] as RouteCategory[]
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer font-sans text-xs",
                    activeCategory === cat
                      ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/40 font-semibold"
                      : "bg-muted/40 text-muted-foreground border-border hover:border-cyan-500/30 hover:text-foreground"
                  )}
                >
                  {t(`categories.${cat}`)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── View Mode Content Area ── */}
        <div className="p-4 sm:p-6 overflow-x-auto min-h-[380px]">
          {viewMode === "api" ? (
            /* ════════════════════════════════════════════════════════════════
               API CONTRACTS & BACKEND SPECS VIEW (FOR BACKEND COLLABORATOR)
               ════════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {/* 1. API Architecture Metrics Cards (Live & Dynamic) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
                <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex flex-col gap-1 shadow-2xs">
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>{t("statTotalEndpoints")}</span>
                    <Layers className="size-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-black text-foreground fa-num">
                    {apiStats.total}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {Object.keys(apiStats.byDomain).length} {isRtl ? "حوزه ماژولار فعال" : "active domains"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-1 shadow-2xs">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    <span>{t("statRealEndpoints")}</span>
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 fa-num">
                    {apiStats.real}
                  </div>
                  <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                    Next.js App Router روت‌های زنده
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-violet-500/5 dark:bg-violet-950/20 border border-violet-500/30 flex flex-col gap-1 shadow-2xs">
                  <div className="flex items-center justify-between text-violet-700 dark:text-violet-400 text-xs font-semibold">
                    <span>{t("statDualEndpoints")}</span>
                    <Server className="size-4 text-violet-500" />
                  </div>
                  <div className="text-2xl font-black text-violet-600 dark:text-violet-400 fa-num">
                    {apiStats.dual}
                  </div>
                  <div className="text-[10px] text-violet-700/80 dark:text-violet-400/80">
                    {isRtl ? "سرویس‌های Real + Fake همگام" : "Dual sync services"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 flex flex-col gap-1 shadow-2xs">
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold">
                    <span>{t("statFakeEndpoints")}</span>
                    <FileCode2 className="size-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 fa-num">
                    {apiStats.fake}
                  </div>
                  <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                    {isRtl ? "شبیه‌سازهای کلاینت و قرارداد" : "Client mock contracts"}
                  </div>
                </div>
              </div>

              {/* 2. Architecture & Fake vs Real Explainer Banner */}
              <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/20 p-4 sm:p-5 space-y-4 font-sans shadow-xs">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Server className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground">
                        {t("apiArchitectureTitle")}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("apiArchitectureDesc")}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 rounded-xl border-border/80"
                    onClick={() => setShowArchGuide(!showArchGuide)}
                  >
                    <span>{showArchGuide ? (isRtl ? "بستن راهنما" : "Hide Guide") : (isRtl ? "مشاهده راهنما" : "Show Guide")}</span>
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        showArchGuide && "rotate-180"
                      )}
                    />
                  </Button>
                </div>

                {showArchGuide && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {API_ARCHITECTURE_OVERVIEW.principles.map((p) => {
                      const isReal = p.id === "real";
                      const isDual = p.id === "dual";
                      return (
                        <div
                          key={p.id}
                          className={cn(
                            "p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 text-xs transition-colors",
                            isReal
                              ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30"
                              : isDual
                              ? "bg-violet-500/5 dark:bg-violet-950/20 border-violet-500/30"
                              : "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30"
                          )}
                        >
                          <div className="space-y-1.5">
                            <span
                              className={cn(
                                "text-[11px] font-bold px-2 py-0.5 rounded-md inline-block border",
                                isReal
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                  : isDual
                                  ? "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              )}
                            >
                              {isRtl ? p.badgeFa : p.badgeEn}
                            </span>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                              {isRtl ? p.descriptionFa : p.descriptionEn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Standard Response Envelope Header Card */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 sm:p-5 space-y-3 font-sans">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-500" />
                    <h3 className="font-bold text-sm sm:text-base text-foreground">
                      {t("standardEnvelopeTitle")}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 rounded-lg border-border"
                    onClick={() => setShowEnvelope(!showEnvelope)}
                  >
                    <span>{showEnvelope ? (isRtl ? "مخفی‌سازی قالب" : "Hide Envelope") : (isRtl ? "نمایش قالب" : "Show Envelope")}</span>
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform",
                        showEnvelope && "rotate-180"
                      )}
                    />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("standardEnvelopeDesc")}
                </p>

                {showEnvelope && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2 font-mono text-xs" dir="ltr">
                    {/* Success Envelope */}
                    <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-2">
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                        <span>{t("successSchemaTitle")}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20">
                          HTTP 200 / 201
                        </span>
                      </div>
                      <pre className="text-[11px] leading-relaxed text-foreground/90 overflow-x-auto p-2.5 rounded-lg bg-background/80 border border-border/60">
                        {JSON.stringify(STANDARD_RESPONSE_ENVELOPE.successSchema, null, 2)}
                      </pre>
                    </div>

                    {/* Error Envelope */}
                    <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-2">
                      <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 font-bold text-xs">
                        <span>{t("errorSchemaTitle")}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20">
                          HTTP 4xx / 5xx
                        </span>
                      </div>
                      <pre className="text-[11px] leading-relaxed text-foreground/90 overflow-x-auto p-2.5 rounded-lg bg-background/80 border border-border/60">
                        {JSON.stringify(STANDARD_RESPONSE_ENVELOPE.errorSchema, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Endpoints Count Summary */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-sans">
                <span className="font-semibold text-foreground">
                  {filteredApis.length} {t("totalEndpoints")}
                </span>
                <span>{t("apiSubtitle")}</span>
              </div>

              {/* Endpoint Cards List */}
              {filteredApis.length === 0 ? (
                <div className="py-16 text-center space-y-2 font-sans">
                  <p className="text-muted-foreground text-sm">{t("noApisFound")}</p>
                  <p className="text-muted-foreground/60 text-xs">
                    0 endpoints match current filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApis.map((api) => {
                    const isExpanded = Boolean(expandedApiIds[api.id]);

                    return (
                      <div
                        key={api.id}
                        className="rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors overflow-hidden shadow-2xs"
                      >
                        {/* Endpoint Header Bar */}
                        <div
                          onClick={() => toggleApiExpand(api.id)}
                          className="p-3.5 sm:p-4 cursor-pointer hover:bg-muted/20 transition-colors select-none flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            {/* Method Badge */}
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-mono font-bold border shrink-0",
                                getMethodBadgeClass(api.method)
                              )}
                            >
                              {api.method}
                            </span>

                            {/* Path and Title */}
                            <div className="min-w-0 font-sans">
                              <div className="flex items-center gap-2 flex-wrap" dir="ltr">
                                <span className="font-mono text-xs sm:text-sm font-bold text-foreground break-all text-left">
                                  {api.path}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {isRtl ? api.titleFa : api.titleEn} —{" "}
                                {isRtl ? api.descriptionFa : api.descriptionEn}
                              </p>
                            </div>
                          </div>

                          {/* Right Badges & Controls */}
                          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto font-sans flex-wrap justify-end">
                            {/* Implementation Badge (Fake / Real / Dual) */}
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1",
                                getImplBadgeClass(api.implementationType)
                              )}
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  api.implementationType === "real"
                                    ? "bg-emerald-500"
                                    : api.implementationType === "dual"
                                    ? "bg-violet-500"
                                    : "bg-amber-500"
                                )}
                              />
                              <span>
                                {api.implementationType === "real" && t("implRealBadge")}
                                {api.implementationType === "dual" && t("implDualBadge")}
                                {api.implementationType === "fake" && t("implFakeBadge")}
                              </span>
                            </span>

                            {/* Workflow Stage */}
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                              {isRtl ? api.stageFa : api.stageEn}
                            </span>

                            {/* Required Role */}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-mono">
                              {api.requiredRole}
                            </span>

                            <ChevronDown
                              className={cn(
                                "size-4 text-muted-foreground transition-transform duration-200 ms-1",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </div>
                        </div>

                        {/* Expanded Contract Details */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/10 space-y-4 font-sans text-xs">
                            {/* Architecture & Implementation Details Box */}
                            <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="flex items-center gap-1.5 text-foreground">
                                  <Server className="size-3.5 text-primary" />
                                  <span>{t("apiArchitectureTitle")}</span>
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                    getImplBadgeClass(api.implementationType)
                                  )}
                                >
                                  {api.implementationType === "real" && t("implRealBadge")}
                                  {api.implementationType === "dual" && t("implDualBadge")}
                                  {api.implementationType === "fake" && t("implFakeBadge")}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {isRtl ? api.implementationDetailsFa : api.implementationDetailsEn}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]" dir="ltr">
                                {api.serverHandlerPath && (
                                  <div className="flex items-center gap-1.5 font-mono text-[10px] bg-muted/50 px-2 py-1 rounded-lg border border-border/50">
                                    <span className="text-muted-foreground font-sans font-medium">{t("serverHandler")}</span>
                                    <span className="text-primary font-bold">{api.serverHandlerPath}</span>
                                  </div>
                                )}
                                {api.clientServicePath && (
                                  <div className="flex items-center gap-1.5 font-mono text-[10px] bg-muted/50 px-2 py-1 rounded-lg border border-border/50">
                                    <span className="text-muted-foreground font-sans font-medium">{t("clientService")}</span>
                                    <span className="text-foreground font-bold">{api.clientServicePath}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Bar: Copy cURL + Copy Path */}
                            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-border/40">
                              <div className="text-xs text-muted-foreground">
                                <strong>{t("requiredRole")}:</strong>{" "}
                                <span className="text-foreground font-semibold">
                                  {api.requiredRole}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1.5 rounded-lg border-border"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyCurl(api);
                                  }}
                                >
                                  {copiedCurlId === api.id ? (
                                    <>
                                      <Check className="size-3 text-emerald-500" />
                                      <span className="text-emerald-600 font-bold">
                                        {t("curlCopied")}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Code2 className="size-3 text-muted-foreground" />
                                      <span>{t("copyCurl")}</span>
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1.5 rounded-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(api.path);
                                  }}
                                >
                                  <Copy className="size-3" />
                                  <span>{t("copyEndpoint")}</span>
                                </Button>
                              </div>
                            </div>

                            {/* Two-Column Grid: Request vs Success Response */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" dir="ltr">
                              {/* Left: Request Payload */}
                              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                                  <span className="flex items-center gap-1.5">
                                    <Send className="size-3.5 text-primary" />
                                    <span>{t("requestBody")}</span>
                                  </span>
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    Content-Type: application/json
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                  {isRtl
                                    ? api.requestBody?.schemaDescriptionFa ||
                                      "بدون بدنه درخواست (No payload required)"
                                    : api.requestBody?.schemaDescriptionEn ||
                                      "No request body needed"}
                                </p>
                                {api.requestBody?.samplePayload ? (
                                  <pre className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] font-mono leading-relaxed text-foreground overflow-x-auto max-h-[220px]">
                                    {JSON.stringify(
                                      api.requestBody.samplePayload,
                                      null,
                                      2
                                    )}
                                  </pre>
                                ) : (
                                  <div className="p-3 rounded-lg bg-muted/20 text-muted-foreground text-[11px] font-mono text-center">
                                    // Query parameters or URL path only
                                  </div>
                                )}
                              </div>

                              {/* Right: Success Response */}
                              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                  <span className="flex items-center gap-1.5">
                                    <Check className="size-3.5 text-emerald-500" />
                                    <span>{t("successResponse")}</span>
                                  </span>
                                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30">
                                    HTTP {api.successResponse.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                  {isRtl
                                    ? api.successResponse.descriptionFa
                                    : api.successResponse.descriptionEn}
                                </p>
                                <pre className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] font-mono leading-relaxed text-foreground overflow-x-auto max-h-[220px]">
                                  {JSON.stringify(
                                    api.successResponse.samplePayload,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            </div>

                            {/* Error Scenarios Table / List */}
                            {api.errorScenarios.length > 0 && (
                              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
                                  <AlertTriangle className="size-3.5 text-rose-500" />
                                  <span>{t("errorScenarios")}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1" dir="ltr">
                                  {api.errorScenarios.map((err, errIdx) => (
                                    <div
                                      key={errIdx}
                                      className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between text-[11px] font-mono">
                                        <span className="font-bold text-rose-600 dark:text-rose-400">
                                          {err.code}
                                        </span>
                                        <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] border border-rose-500/20 font-bold">
                                          HTTP {err.status}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-muted-foreground font-sans">
                                        {isRtl
                                          ? err.descriptionFa
                                          : err.descriptionEn}
                                      </p>
                                      <pre className="p-1.5 rounded bg-background border border-border/50 text-[10px] font-mono text-muted-foreground overflow-x-auto">
                                        {JSON.stringify(err.samplePayload, null, 2)}
                                      </pre>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : filteredRoutes.length === 0 ? (
            /* Empty State for Tree / Table / JSON */
            <div className="py-16 text-center space-y-2">
              <p className="text-muted-foreground font-sans text-sm">
                {t("noRoutesFound")}
              </p>
              <p className="text-muted-foreground/60 text-xs font-mono">
                0 matching routes found in active registry.
              </p>
            </div>
          ) : viewMode === "tree" ? (
            /* ════════════════════════════════════════════════════════════════
               TREE VIEW (ASCII HIERARCHICAL) - THEME ADAPTIVE
               ════════════════════════════════════════════════════════════════ */
            <div className="space-y-6 text-sm" dir="ltr">
              <div className="text-primary font-bold flex items-center gap-2 pb-1 border-b border-border/40">
                <span>/ (root)</span>
                <span className="text-xs font-normal text-muted-foreground">
                  [{filteredRoutes.length} endpoints active]
                </span>
              </div>

              {(Object.keys(groupedRoutes) as RouteCategory[]).map((cat) => {
                const routesInCat = groupedRoutes[cat];
                if (!routesInCat || routesInCat.length === 0) return null;

                const catLabel = t(`categories.${cat}`);

                return (
                  <div key={cat} className="space-y-2">
                    {/* Category Branch Line */}
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <span className="text-muted-foreground/60">├──</span>
                      <span className="text-cyan-700 dark:text-cyan-400 font-mono font-bold">
                        /{cat}
                      </span>
                      <span className="text-xs font-sans text-muted-foreground font-normal">
                        ({catLabel})
                      </span>
                    </div>

                    {/* Leaf Routes in Category */}
                    <div className="ms-4 space-y-1.5 border-l border-border/70 pl-3">
                      {routesInCat.map((route, idx) => {
                        const isLast = idx === routesInCat.length - 1;
                        const branchChar = isLast ? "└──" : "├──";

                        return (
                          <div
                            key={route.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-muted-foreground/60 shrink-0">
                                {branchChar}
                              </span>
                              <Link
                                href={route.path}
                                className="text-primary hover:underline font-mono text-xs sm:text-sm font-semibold flex items-center gap-1.5 truncate dark:text-emerald-400"
                              >
                                <span>{route.path}</span>
                                <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </Link>
                              <span className="text-muted-foreground text-xs font-sans truncate ms-1">
                                — {isRtl ? route.titleFa : route.titleEn}
                              </span>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 ms-6 sm:ms-0">
                              {/* Access Badge */}
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border",
                                  route.access === "public"
                                    ? "bg-muted text-muted-foreground border-border"
                                    : route.access === "auth"
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium"
                                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 font-medium"
                                )}
                              >
                                {route.access}
                              </span>

                              {/* Render Type */}
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border">
                                {route.renderType}
                              </span>

                              {/* HTTP Status */}
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-semibold">
                                {route.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === "table" ? (
            /* ════════════════════════════════════════════════════════════════
               TABLE / LS -LA VIEW - THEME ADAPTIVE
               ════════════════════════════════════════════════════════════════ */
            <div className="overflow-x-auto" dir="ltr">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground bg-muted/20">
                    <th className="py-2.5 px-3 font-semibold uppercase">Perms</th>
                    <th className="py-2.5 px-3 font-semibold uppercase">Status</th>
                    <th className="py-2.5 px-3 font-semibold uppercase">Access</th>
                    <th className="py-2.5 px-3 font-semibold uppercase">Method</th>
                    <th className="py-2.5 px-3 font-semibold uppercase">Path</th>
                    <th className="py-2.5 px-3 font-semibold uppercase font-sans">
                      Title & Description
                    </th>
                    <th className="py-2.5 px-3 font-semibold uppercase text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredRoutes.map((route) => (
                    <tr
                      key={route.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      <td className="py-2.5 px-3 text-muted-foreground">drwxr-xr-x</td>
                      <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400 font-semibold">
                        {route.status}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] border uppercase",
                            route.access === "public"
                              ? "bg-muted text-muted-foreground border-border"
                              : route.access === "auth"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium"
                              : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 font-medium"
                          )}
                        >
                          {route.access}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-cyan-700 dark:text-cyan-400 font-bold">
                        GET
                      </td>
                      <td className="py-2.5 px-3 font-medium text-primary dark:text-emerald-400">
                        <Link href={route.path} className="hover:underline">
                          {route.path}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-foreground/80 max-w-xs truncate">
                        {isRtl ? route.titleFa : route.titleEn}
                        <span className="text-muted-foreground block text-[11px] truncate">
                          {isRtl ? route.descFa : route.descEn}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={route.path}
                          className="inline-flex items-center gap-1 text-[11px] font-sans text-primary hover:underline"
                        >
                          <span>{t("routeAction")}</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════════════
               RAW JSON VIEW - THEME ADAPTIVE
               ════════════════════════════════════════════════════════════════ */
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 font-mono text-xs overflow-x-auto" dir="ltr">
              <pre className="text-foreground/90 leading-relaxed">
                {JSON.stringify(filteredRoutes, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
