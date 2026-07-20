// src/services/index.ts
// ═════════════════════════════════════════════════════════════════════════════
// نقطه مرکزی اتصال. وقتی به سرور واقعی وصل می‌شوی، فقط این فایل را تغییر بده.
//
// نحوه سوییچ به real API:
//   ۱. در .env.local بنویس:  NEXT_PUBLIC_API_MODE=real
//                            NEXT_PUBLIC_API_BASE_URL=https://api.yourserver.com
//   ۲. همین! تمام هوک‌ها و کامپوننت‌ها بدون تغییر به real API وصل می‌شوند.
//
// هیچ component یا hook نباید مستقیماً FakeXService یا RealXService وارد کند.
// همه باید از این فایل (api.auth، api.dashboard، ...) استفاده کنند.
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
import { AparatService, type IAparatService } from "./aparat.service";

// ─── حالت فعلی ────────────────────────────────────────────────────────────────

export type ApiMode = "fake" | "real";

export const API_MODE: ApiMode =
  (process.env.NEXT_PUBLIC_API_MODE as ApiMode) ?? "fake";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

const http = new HttpClient(API_BASE_URL);

// ─── انتخاب پیاده‌سازی بر اساس حالت ───────────────────────────────────────────

function pick<TFake, TReal>(fake: TFake, real: TReal): TFake | TReal {
  return API_MODE === "real" ? real : fake;
}

// ─── نمونه‌های Singleton ──────────────────────────────────────────────────────
// هر سرویس فقط یک‌بار ساخته می‌شود و در کل اپ به‌اشتراک می‌رود.

export const api = {
  auth: pick<IAuthService, IAuthService>(
    new FakeAuthService(),
    new RealAuthService(http),
  ),

  dashboard: pick<IDashboardService, IDashboardService>(
    new FakeDashboardService(),
    new RealDashboardService(http),
  ),

  navigation: pick<INavigationService, INavigationService>(
    new FakeNavigationService(),
    new RealNavigationService(http),
  ),

  search: pick<ISearchService, ISearchService>(
    new FakeSearchService(),
    new RealSearchService(http),
  ),

  stats: pick<IStatsService, IStatsService>(
    new FakeStatsService(),
    new RealStatsService(http),
  ),

  user: pick<IUserService, IUserService>(
    new FakeUserService(),
    new RealUserService(http),
  ),

  preferences: pick<IPreferencesService, IPreferencesService>(
    new FakePreferencesService(),
    new RealPreferencesService(http),
  ),

  // Aparat همیشه از یک پیاده‌سازی استفاده می‌کند (نه fake/real سوییچ‌پذیر)
  // چون منبع داده شخص‌ثالث است، نه backend خودمان.
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
export type {
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "./user.service";
export type { UserPreferences } from "./preferences.service";
