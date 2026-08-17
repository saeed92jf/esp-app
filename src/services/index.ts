// src/services/index.ts
// ═════════════════════════════════════════════════════════════════════════════
//
//  ██████╗ ███████╗██████╗ ██╗   ██╗██╗ ██████╗███████╗    ██████╗ ███████╗ ██████╗
//  ██╔════╝██╔════╝██╔══██╗██║   ██║██║██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔════╝
//  ███████╗█████╗  ██████╔╝██║   ██║██║██║     █████╗      ██████╔╝█████╗  ██║  ███╗
//  ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██║██║     ██╔══╝      ██╔══██╗██╔══╝  ██║   ██║
//  ███████║███████╗██║  ██║ ╚████╔╝ ██║╚██████╗███████╗    ██║  ██║███████╗╚██████╔╝
//  ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝ ╚═════╝╚══════╝    ╚═╝  ╚═╝╚══════╝ ╚═════╝
//
// ─────────────────────────────────────────────────────────────────────────────
// نقطه مرکزی DI (Dependency Injection).
// هیچ component یا hook نباید مستقیماً FakeXService یا RealXService وارد کند.
// همه از این فایل مصرف می‌کنند: api.auth، api.dashboard، ...
// ═════════════════════════════════════════════════════════════════════════════

import { HttpClient } from "./core/http";

import {
  FakeAuthService,
  RealAuthService,
  type IAuthService,
} from "@/modules/auth/services/auth.service";
import {
  FakeDashboardService,
  RealDashboardService,
  type IDashboardService,
} from "@/modules/dashboard/services/dashboard.service";
import {
  FakeNavigationService,
  RealNavigationService,
  type INavigationService,
} from "./navigation.service";
import {
  FakeSearchService,
  RealSearchService,
  type ISearchService,
} from "./search.service";
import {
  FakeStatsService,
  RealStatsService,
  type IStatsService,
} from "./stats.service";
import {
  FakeUserService,
  RealUserService,
  type IUserService,
} from "./user.service";
import {
  FakePreferencesService,
  RealPreferencesService,
  type IPreferencesService,
} from "./preferences.service";
import {
  FakeCommoditiesService,
  RealCommoditiesService,
  type ICommoditiesService,
} from "@/modules/dashboard/services/commodities.service";
import {
  FakeExchangeRatesService,
  RealExchangeRatesService,
  type IExchangeRatesService,
} from "@/modules/dashboard/services/exchange-rates.service";
import { AparatService, type IAparatService } from "./aparat.service";

// ═════════════════════════════════════════════════════════════════════════════
// ⚙️  حالت پیش‌فرض جهانی  (از .env.local خوانده می‌شود)
//
//  NEXT_PUBLIC_API_MODE=fake   ← پیش‌فرض: داده‌های Fake برای توسعه محلی
//  NEXT_PUBLIC_API_MODE=real   ← پروداکشن: سرویس‌ها به backend واقعی وصل می‌شوند
// ═════════════════════════════════════════════════════════════════════════════

export type ApiMode = "fake" | "real";

const GLOBAL_API_MODE: ApiMode =
  (process.env.NEXT_PUBLIC_API_MODE as ApiMode) ?? "fake";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

const http = new HttpClient(API_BASE_URL);

// ═════════════════════════════════════════════════════════════════════════════
// 🗺️  جدول وضعیت سرویس‌ها  ← اینجا وضعیت هر سرویس را ببینید و تغییر دهید
//
//  'inherit'  ← از GLOBAL_API_MODE پیروی می‌کند (پیش‌فرض)
//  'fake'     ← همیشه Fake، حتی اگر NEXT_PUBLIC_API_MODE=real باشد
//  'real'     ← همیشه Real، حتی اگر NEXT_PUBLIC_API_MODE=fake باشد
//
//  برای مهاجرت یک سرویس از Fake به Real:
//    ۱. وضعیت آن را اینجا از 'inherit' به 'real' تغییر دهید
//    ۲. مطمئن شوید RealXService پیاده‌سازی کامل دارد
//    ۳. endpoint های لازم را در .env.local تنظیم کنید
// ═════════════════════════════════════════════════════════════════════════════

const SERVICE_MODES = {
  // ──────────────────────────────────── Backend سرویس‌های
  auth:          'inherit',  // 🔴 Fake  — backend احراز هویت هنوز آماده نیست
  dashboard:     'inherit',  // 🔴 Fake  — داده‌های داشبورد هنوز از backend نمی‌آیند
  navigation:    'inherit',  // 🔴 Fake  — منوی ناوبری هنوز static است
  search:        'inherit',  // 🔴 Fake  — جستجوی سراسری هنوز backend ندارد
  stats:         'inherit',  // 🔴 Fake  — آمارها هنوز از backend نمی‌آیند
  user:          'inherit',  // 🔴 Fake  — پروفایل کاربری هنوز backend ندارد
  preferences:   'inherit',  // 🔴 Fake  — تنظیمات در localStorage ذخیره می‌شوند

  // ──────────────────────────────────── سرویس‌های داده خارجی (Third-Party)
  commodities:   'inherit',  // 🟡 Inherit — قیمت‌ها از Yahoo Finance (Next.js API route)
  exchangeRates: 'real',     // 🟢 REAL   — نرخ ارز زنده از TGJU، همیشه واقعی
  aparat:        'real',     // 🟢 REAL   — ویدیوهای آپارات، همیشه واقعی
} as const satisfies Record<string, 'fake' | 'real' | 'inherit'>;

// ─────────────────────────────────────────────────────────────────────────────
// تابع کمکی: بر اساس جدول SERVICE_MODES، پیاده‌سازی صحیح را انتخاب می‌کند
// ─────────────────────────────────────────────────────────────────────────────

function pickService<T>(
  service: keyof typeof SERVICE_MODES,
  fake: T,
  real: T
): T {
  const override = SERVICE_MODES[service];
  const effectiveMode: ApiMode = override === 'inherit' ? GLOBAL_API_MODE : override;
  return effectiveMode === 'real' ? real : fake;
}

// Re-export for backward compatibility (some hooks use API_MODE directly)
export const API_MODE = GLOBAL_API_MODE;

// ═════════════════════════════════════════════════════════════════════════════
// 🏗️  Singleton Instances — هر سرویس فقط یک‌بار ساخته می‌شود
// ═════════════════════════════════════════════════════════════════════════════

export const api = {
  auth: pickService<IAuthService>('auth',
    new FakeAuthService(),
    new RealAuthService(http),
  ),

  dashboard: pickService<IDashboardService>('dashboard',
    new FakeDashboardService(),
    new RealDashboardService(http),
  ),

  navigation: pickService<INavigationService>('navigation',
    new FakeNavigationService(),
    new RealNavigationService(http),
  ),

  search: pickService<ISearchService>('search',
    new FakeSearchService(),
    new RealSearchService(http),
  ),

  stats: pickService<IStatsService>('stats',
    new FakeStatsService(),
    new RealStatsService(http),
  ),

  user: pickService<IUserService>('user',
    new FakeUserService(),
    new RealUserService(http),
  ),

  preferences: pickService<IPreferencesService>('preferences',
    new FakePreferencesService(),
    new RealPreferencesService(http),
  ),

  commodities: pickService<ICommoditiesService>('commodities',
    new FakeCommoditiesService(),
    new RealCommoditiesService(http),
  ),

  // نرخ ارز — همیشه Real (مستقل از GLOBAL_API_MODE)
  exchangeRates: pickService<IExchangeRatesService>('exchangeRates',
    new FakeExchangeRatesService(),
    new RealExchangeRatesService(),
  ),

  // آپارات — همیشه Real (مستقل از GLOBAL_API_MODE)
  aparat: new AparatService() as IAparatService,
};

// ─── Re-export برای راحتی import ──────────────────────────────────────────────

export { ApiError, toApiError } from "./core/errors";
export type { ErrorCode } from "./core/errors";
export type {
  ApiResult,
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse,
  PaginationMeta,
  ListParams,
} from "./core/types";

export type { NavigationResult } from "./navigation.service";
export type {
  SearchResult,
  SearchPayload,
  SearchResponse,
} from "./search.service";
export type { StatItem } from "./stats.service";
export type { UserPreferences } from "./preferences.service";
export type {
  DashboardData,
  StatCard as DashboardStatCard,
  ChartPoint,
  ActivityItem,
  Trend as DashboardTrend,
  IconName as DashboardIconName,
} from "@/modules/dashboard/services/dashboard.service";
