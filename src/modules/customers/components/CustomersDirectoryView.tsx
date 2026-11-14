// src/modules/customers/components/CustomersDirectoryView.tsx
"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Search,
  Filter,
  Plus,
  Globe,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2,
  Briefcase,
  Layers,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Info,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { customersService } from "../services/customers.service";
import type { Customer, CustomersListResponse } from "../types/customers.types";
import { AddCustomerModal } from "./AddCustomerModal";
import { CustomerDetailModal } from "./CustomerDetailModal";
import { EditCustomerModal } from "./EditCustomerModal";
import { useAuth } from "@/modules/auth/hooks/use-auth";

const PAGE_SIZE = 48;

export interface CustomersDirectoryViewProps {
  isAdmin?: boolean;
  onNavigateToCreate?: () => void;
  onCustomerUpdated?: (customer: Customer) => void;
}

export function CustomersDirectoryView({
  isAdmin: propIsAdmin,
  onNavigateToCreate,
  onCustomerUpdated,
}: CustomersDirectoryViewProps = {}) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const cachedInitial = useMemo(() => {
    return customersService.getCachedCustomers({ limit: PAGE_SIZE, offset: 0 });
  }, []);

  const [customers, setCustomers] = useState<Customer[]>(() => cachedInitial?.items || []);
  const [totalCount, setTotalCount] = useState(() => cachedInitial?.total || 0);
  const [industriesList, setIndustriesList] = useState<{ name: string; count: number }[]>(() => cachedInitial?.industries || []);
  const [citiesList, setCitiesList] = useState<string[]>(() => cachedInitial?.cities || []);
  const [isLoading, setIsLoading] = useState(() => !cachedInitial);
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search");

  // Filters
  const [search, setSearch] = useState(() => urlSearch || "");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [onlyWithLogo, setOnlyWithLogo] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    if (urlSearch !== null && urlSearch !== undefined && urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { user } = useAuth();
  const isAdmin = propIsAdmin ?? Boolean(user && (user.role === "admin" || user.role === "superadmin"));

  const handleCustomerUpdatedInternal = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (detailCustomer?.id === updated.id) {
      setDetailCustomer(updated);
    }
    onCustomerUpdated?.(updated);
  };

  // Pagination offset
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initial and filtered load
  const loadCustomers = async (
    currentSearch: string,
    currentInd: string,
    currentCity: string,
    withLogo: boolean,
    loadMore = false,
    newOffset = 0
  ) => {
    const isUnfilteredInitial = !currentSearch.trim() && currentInd === "ALL" && currentCity === "ALL" && !withLogo && newOffset === 0;
    const hasCache = isUnfilteredInitial && Boolean(cachedInitial);

    if (loadMore) {
      setIsLoadingMore(true);
    } else if (!hasCache) {
      setIsLoading(true);
    }

    try {
      const res = await customersService.getCustomers({
        search: currentSearch.trim() || undefined,
        industry: currentInd !== "ALL" ? currentInd : undefined,
        city: currentCity !== "ALL" ? currentCity : undefined,
        has_logo: withLogo ? true : undefined,
        limit: PAGE_SIZE,
        offset: newOffset,
      });

      if (loadMore) {
        setCustomers((prev) => [...prev, ...res.items]);
      } else {
        setCustomers(res.items);
      }

      setTotalCount(res.total);
      if (res.industries?.length > 0) setIndustriesList(res.industries);
      if (res.cities?.length > 0) setCitiesList(res.cities);

      const nextOffset = newOffset + res.items.length;
      setOffset(nextOffset);
      setHasMore(nextOffset < res.total);
    } catch (err: any) {
      toast.error(err?.message || (isRtl ? "خطا در دریافت فهرست کارفرمایان" : "Failed to load customers"));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Debounced search & filter trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        loadCustomers(search, selectedIndustry, selectedCity, onlyWithLogo, false, 0);
      });
    }, 250);

    return () => clearTimeout(handler);
  }, [search, selectedIndustry, selectedCity, onlyWithLogo]);

  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    loadCustomers(search, selectedIndustry, selectedCity, onlyWithLogo, true, offset);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-150" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top Banner / Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 backdrop-blur-sm p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Building2 className="size-3.5" />
                <span>{isRtl ? "بانک اطلاعات کارفرمایان و کارخانجات" : "Enterprise Client Directory"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {isRtl ? "فهرست کارفرمایان و مشتریان صنعتی" : "Clients & Industrial Customers"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {isRtl
                  ? "مرجع رسمی کارفرمایان صنایع نفت، گاز، پتروشیمی، پالایشگاهی، فولاد، نیروگاهی و تجهیزات فرآیندی طرف قرارداد یورو اسلات پارس."
                  : "Official directory of industrial clients across Oil, Gas, Petrochemical, Steel, Power Plant, and Process Equipment."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  if (onNavigateToCreate) {
                    onNavigateToCreate();
                  } else {
                    setIsAddModalOpen(true);
                  }
                }}
                className="rounded-xl h-11 px-5 text-sm font-semibold gap-2 shadow-lg shadow-primary/20"
              >
                <Plus className="size-4" />
                <span>{isRtl ? "افزودن کارفرمای جدید" : "Add New Client"}</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl border border-border/80 bg-background/80 shadow-2xs space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                <span>{isRtl ? "کل کارفرمایان ثبت‌شده" : "Total Clients"}</span>
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {totalCount.toLocaleString(isRtl ? "fa-IR" : "en-US")}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-border/80 bg-background/80 shadow-2xs space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-amber-500" />
                <span>{isRtl ? "تعداد صنایع" : "Industries"}</span>
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {industriesList.length.toLocaleString(isRtl ? "fa-IR" : "en-US")}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-border/80 bg-background/80 shadow-2xs space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-emerald-500" />
                <span>{isRtl ? "شهرهای تحت پوشش" : "Covered Cities"}</span>
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {citiesList.length.toLocaleString(isRtl ? "fa-IR" : "en-US")}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-border/80 bg-background/80 shadow-2xs space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-sky-500" />
                <span>{isRtl ? "دارای نشان / لوگو" : "With Logo"}</span>
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                440+
              </div>
            </div>
          </div>
        </div>
        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isRtl
                    ? "جستجو در نام فارسی، نام انگلیسی، شهر، شناسه ملی یا کد اقتصادی..."
                    : "Search by company title, English name, city, national ID..."
                }
                className="ps-10 pe-10 h-11 text-sm rounded-xl bg-background"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* City Filter */}
            <div className="w-full sm:w-48">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-11 px-3 text-xs sm:text-sm rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">{isRtl ? "همه شهرها" : "All Cities"}</option>
                {citiesList.map((cty) => (
                  <option key={cty} value={cty}>
                    {cty}
                  </option>
                ))}
              </select>
            </div>

            {/* Logo Toggle */}
            <Button
              type="button"
              variant={onlyWithLogo ? "default" : "outline"}
              onClick={() => setOnlyWithLogo(!onlyWithLogo)}
              className="h-11 rounded-xl text-xs gap-1.5 px-3.5 shrink-0 w-full sm:w-auto"
            >
              <ImageIcon className="size-3.5" />
              <span>{isRtl ? "فقط دارای لوگو" : "With Logo Only"}</span>
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-border p-1 bg-muted/30 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "grid" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
                title={isRtl ? "نمایش شبکه‌ای" : "Grid View"}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "table" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
                title={isRtl ? "نمایش جدول" : "Table View"}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Industry Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedIndustry("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-full font-medium transition-all shrink-0",
                selectedIndustry === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {isRtl ? "همه صنایع" : "All Industries"} ({totalCount})
            </button>
            {industriesList.slice(0, 10).map((ind) => (
              <button
                key={ind.name}
                onClick={() => setSelectedIndustry(ind.name)}
                className={cn(
                  "px-3 py-1.5 rounded-full font-medium transition-all shrink-0",
                  selectedIndustry === ind.name
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                )}
              >
                {ind.name} ({ind.count})
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <div>
            {isRtl ? (
              <span>
                نمایش <strong>{customers.length}</strong> از <strong>{totalCount}</strong> کارفرما
              </span>
            ) : (
              <span>
                Showing <strong>{customers.length}</strong> of <strong>{totalCount}</strong> clients
              </span>
            )}
          </div>
          {isLoading && (
            <div className="flex items-center gap-1.5 text-primary">
              <Loader2 className="size-3.5 animate-spin" />
              <span>{isRtl ? "در حال دریافت داده‌ها..." : "Loading data..."}</span>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && customers.length === 0 && (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50 space-y-4">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Building2 className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                {isRtl ? "کارفرمایی با این مشخصات یافت نشد" : "No clients match your criteria"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {isRtl
                  ? "می‌توانید عبارت جستجو را تغییر دهید یا کارفرمای جدیدی به سامانه اضافه کنید."
                  : "Try adjusting your search filters or add a new client to the directory."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedIndustry("ALL");
                  setSelectedCity("ALL");
                  setOnlyWithLogo(false);
                }}
                className="rounded-xl text-xs h-9"
              >
                {isRtl ? "پاکسازی فیلترها" : "Reset Filters"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (onNavigateToCreate) {
                    onNavigateToCreate();
                  } else {
                    setIsAddModalOpen(true);
                  }
                }}
                className="rounded-xl text-xs h-9 gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>{isRtl ? "افزودن کارفرمای جدید" : "Add Customer"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && customers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => setDetailCustomer(c)}
                className="group relative flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Top Bar: Logo & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative size-14 rounded-xl border border-border/70 bg-background p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {c.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.logo_url}
                          alt={c.persian_title_fa || c.company_name_en}
                          className="object-contain size-full"
                          loading="lazy"
                        />
                      ) : (
                        <div className="size-full rounded-lg bg-primary/5 text-primary flex items-center justify-center text-xs font-bold font-mono">
                          {(c.persian_title_fa || c.company_name_en || "C").slice(0, 2)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {c.industry && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-2 py-0.5 max-w-[140px] truncate"
                          title={c.industry}
                        >
                          {c.industry}
                        </Badge>
                      )}
                      {c.city && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground/80" />
                          <span>{c.city}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Company Titles */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {c.persian_title_fa || c.company_name_en}
                    </h3>
                    {c.company_name_en && c.company_name_en !== c.persian_title_fa && (
                      <p className="text-[11px] text-muted-foreground font-sans line-clamp-1">
                        {c.company_name_en}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Quick Info & Action */}
                <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {c.website && (
                      <a
                        href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title={c.website}
                      >
                        <Globe className="size-3.5" />
                      </a>
                    )}
                    {c.tel_code1 && (
                      <a
                        href={`tel:${c.tel_code1.replace(/[^0-9+]/g, "")}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                        title={c.tel_code1}
                      >
                        <Phone className="size-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {isAdmin && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCustomer(c);
                        }}
                        className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        title={isRtl ? "ویرایش مشخصات کارفرما (ادمین)" : "Edit Client Details (Admin)"}
                      >
                        <Pencil className="size-3" />
                        <span>{isRtl ? "ویرایش" : "Edit"}</span>
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-primary group-hover:underline flex items-center gap-1">
                      <span>{isRtl ? "مشاهده جزئیات" : "Details"}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && customers.length > 0 && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4 text-start">{isRtl ? "لوگو" : "Logo"}</th>
                    <th className="py-3 px-4 text-start">{isRtl ? "نام شرکت (فارسی)" : "Company Name (Fa)"}</th>
                    <th className="py-3 px-4 text-start">{isRtl ? "نام انگلیسی" : "English Name"}</th>
                    <th className="py-3 px-4 text-start">{isRtl ? "صنعت" : "Industry"}</th>
                    <th className="py-3 px-4 text-start">{isRtl ? "شهر" : "City"}</th>
                    <th className="py-3 px-4 text-start">{isRtl ? "وب‌سایت" : "Website"}</th>
                    <th className="py-3 px-4 text-start">{isRtl ? "تماس" : "Phone"}</th>
                    <th className="py-3 px-4 text-center">{isRtl ? "عملیات" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setDetailCustomer(c)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-4">
                        <div className="size-10 rounded-lg border border-border/80 bg-background p-1 flex items-center justify-center shrink-0">
                          {c.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.logo_url}
                              alt={c.persian_title_fa || c.company_name_en}
                              className="object-contain size-full"
                              loading="lazy"
                            />
                          ) : (
                            <Building2 className="size-4 text-muted-foreground/60" />
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-foreground">
                        {c.persian_title_fa || c.company_name_en}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-muted-foreground">
                        {c.company_name_en || "—"}
                      </td>
                      <td className="py-2.5 px-4">
                        {c.industry ? (
                          <Badge variant="secondary" className="text-[10px]">
                            {c.industry}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground">{c.city || "—"}</td>
                      <td className="py-2.5 px-4 font-mono">
                        {c.website ? (
                          <a
                            href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <span>{c.website}</span>
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono" dir="ltr">
                        {c.tel_code1 || "—"}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCustomer(c);
                              }}
                              className="h-7 text-xs rounded-lg px-2 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400 gap-1"
                              title={isRtl ? "ویرایش کارفرما (ادمین)" : "Edit Customer (Admin)"}
                            >
                              <Pencil className="size-3" />
                              <span>{isRtl ? "ویرایش" : "Edit"}</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailCustomer(c);
                            }}
                            className="h-7 text-xs rounded-lg px-2 text-primary"
                          >
                            {isRtl ? "جزئیات" : "View"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="pt-6 flex justify-center">
            <Button
              variant="outline"
              disabled={isLoadingMore}
              onClick={handleLoadMore}
              className="rounded-xl h-11 px-8 text-xs font-semibold gap-2 border-border shadow-xs"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{isRtl ? "در حال دریافت موارد بیشتر..." : "Loading more..."}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="size-3.5" />
                  <span>
                    {isRtl
                      ? `بارگذاری موارد بیشتر (${totalCount - customers.length} مورد باقی‌مانده)`
                      : `Load More (${totalCount - customers.length} remaining)`}
                  </span>
                </>
              )}
            </Button>
          </div>
        )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerAdded={handleCustomerAdded}
      />

      {/* Detail Modal */}
      <CustomerDetailModal
        customer={detailCustomer}
        isOpen={!!detailCustomer}
        onClose={() => setDetailCustomer(null)}
        isAdmin={isAdmin}
        onEdit={(c) => {
          setDetailCustomer(null);
          setEditingCustomer(c);
        }}
      />

      {/* Edit Customer Modal (Admin Only) */}
      <EditCustomerModal
        customer={editingCustomer}
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onCustomerUpdated={handleCustomerUpdatedInternal}
      />
    </div>
  );
}

