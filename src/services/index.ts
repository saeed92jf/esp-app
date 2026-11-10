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
  RealAuthService,
  type IAuthService,
} from "@/modules/auth/services/auth.service";
import {
  RealDashboardService,
  type IDashboardService,
} from "@/modules/dashboard/services/dashboard.service";
import {
  RealNavigationService,
  type INavigationService,
} from "./navigation.service";
import {
  RealSearchService,
  type ISearchService,
} from "./search.service";
import {
  RealStatsService,
  type IStatsService,
} from "./stats.service";
import {
  RealUserService,
  type IUserService,
} from "./user.service";
import {
  RealPreferencesService,
  type IPreferencesService,
} from "./preferences.service";
import {
  RealCommoditiesService,
  type ICommoditiesService,
} from "@/modules/dashboard/services/commodities.service";
import {
  RealExchangeRatesService,
  type IExchangeRatesService,
} from "@/modules/dashboard/services/exchange-rates.service";
import { AparatService, type IAparatService } from "./aparat.service";
import {
  RealAdminService,
} from "@/modules/admin/services/admin.real.service";
import {
  RealNotificationsService,
  type INotificationsService,
} from './notifications.service';
import type { IAdminService } from "@/modules/admin/services/admin.service";

// ═════════════════════════════════════════════════════════════════════════════
// ⚙️  حالت پیش‌فرض جهانی  (از .env.local خوانده می‌شود)
//
//  NEXT_PUBLIC_API_MODE=fake   ← پیش‌فرض: داده‌های Fake برای توسعه محلی
//  NEXT_PUBLIC_API_MODE=real   ← پروداکشن: سرویس‌ها به backend واقعی وصل می‌شوند
// ═════════════════════════════════════════════════════════════════════════════

export type ApiMode = "fake" | "real";

const GLOBAL_API_MODE: ApiMode =
  (process.env.NEXT_PUBLIC_API_MODE as ApiMode) ?? "fake";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/real";

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
  auth:          'real',     // 🟢 REAL  — متصل به بک‌اند واقعی (http://localhost:8080)
  dashboard:     'real',     // 🟢 REAL  — داشبورد سازمانی متصل به داده‌های واقعی
  navigation:    'real',     // 🟢 REAL  — منوی ناوبری
  search:        'real',     // 🟢 REAL  — جستجوی یکپارچه
  stats:         'real',     // 🟢 REAL  — آمارها
  user:          'real',     // 🟢 REAL  — پروفایل کاربری به backend واقعی متصل است
  preferences:   'real',     // 🟢 REAL  — تنظیمات کاربر در backend واقعی ذخیره می‌شوند
  admin:         'real',     // 🟢 REAL  — مدیریت کاربران و درخواست‌ها به backend واقعی متصل است
  notifications: 'real',     // 🟢 REAL  — سیستم اعلان‌ها و نوتیفیکیشن‌های سازمانی

  // ──────────────────────────────────── سرویس‌های داده خارجی (Third-Party)
  commodities:   'real',     // 🟢 REAL   — کریپتو از Finnhub، کالا/فارکس از Yahoo Finance
  exchangeRates: 'real',     // 🟢 REAL   — نرخ ارز زنده از Tetherland، همیشه واقعی
  aparat:        'real',     // 🟢 REAL   — ویدیوهای آپارات، همیشه واقعی
} as const satisfies Record<string, 'fake' | 'real' | 'inherit'>;

// Re-export for backward compatibility (some hooks use API_MODE directly)
export const API_MODE = GLOBAL_API_MODE;

// ═════════════════════════════════════════════════════════════════════════════
// 🏗️  Singleton Instances — هر سرویس فقط یک‌بار ساخته می‌شود
// ═════════════════════════════════════════════════════════════════════════════

export const api = {
  auth: new RealAuthService(http),
  dashboard: new RealDashboardService(http),
  navigation: new RealNavigationService(http),
  search: new RealSearchService(http),
  stats: new RealStatsService(http),
  user: new RealUserService(http),
  preferences: new RealPreferencesService(http),
  commodities: new RealCommoditiesService(http),
  exchangeRates: new RealExchangeRatesService(),
  aparat: new AparatService() as IAparatService,
  notifications: new RealNotificationsService(http),
  admin: new RealAdminService(http),
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
export type { IAdminService } from "@/modules/admin/services/admin.service";
