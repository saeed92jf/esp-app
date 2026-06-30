// src/services/core/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// تمام typeهای مشترک بین سرویس‌ها اینجا تعریف می‌شوند.
// تغییر به real server = فقط همین فایل و http.ts نیاز به بررسی دارند.

// ─── Envelope پاسخ یکپارچه ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  ok: true;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: string;       // مثل: 'INVALID_CREDENTIALS' | 'NOT_FOUND' | 'FORBIDDEN'
    message: string;    // پیام قابل نمایش به کاربر
    details?: Record<string, string[]>;  // خطاهای validation per-field
  };
  status: number;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  ok: true;
}

// ─── Query params مشترک ───────────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface DateRangeParams {
  startDate?: string;  // ISO: '2024-01-01'
  endDate?: string;
}

export interface SortParams {
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export type ListParams = PaginationParams & DateRangeParams & SortParams;

// ─── Token ───────────────────────────────────────────────────────────────────
export const AUTH_TOKEN_KEY = 'esp-auth-token';
export const AUTH_USER_KEY  = 'esp-auth-user';
