// src/services/core/errors.ts
// ─────────────────────────────────────────────────────────────────────────────
// خطاهای یکپارچه. هر دو لایه Fake و Real این class را throw می‌کنند
// تا مصرف‌کننده (hook/component) با یک نوع خطا کار کند.

export type ErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, string[]>;

  constructor(
    code: ErrorCode,
    message: string,
    status = 400,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** آیا این خطا قابل نمایش مستقیم به کاربر است؟ */
  get isUserFacing(): boolean {
    return ['INVALID_CREDENTIALS', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION_ERROR', 'CONFLICT'].includes(this.code);
  }
}

// ─── کمک‌کننده‌ها ─────────────────────────────────────────────────────────────

/** تبدیل خطای ناشناخته به ApiError */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  const errStr = String((err as any)?.message || err || '').toLowerCase();

  if (
    (err instanceof TypeError && errStr.includes('fetch')) ||
    errStr.includes('network') ||
    errStr.includes('failed to fetch') ||
    errStr.includes('econnrefused') ||
    errStr.includes('connection refused') ||
    errStr.includes('load failed')
  ) {
    return new ApiError(
      'NETWORK_ERROR',
      'ارتباط با سرور برقرار نشد. سرور مرکزی در دسترس نیست یا ارتباط با سرور قطع است.',
      0
    );
  }

  if (
    (err instanceof DOMException && (err.name === 'AbortError' || err.name === 'TimeoutError')) ||
    errStr.includes('timeout')
  ) {
    return new ApiError(
      'TIMEOUT',
      'پاسخ سرور با تأخیر همراه بود و پاسخی دریافت نشد. لطفاً دوباره تلاش کنید.',
      408
    );
  }

  if (err instanceof Error) {
    return new ApiError('UNKNOWN', err.message, 500);
  }

  return new ApiError('UNKNOWN', 'خطای نامشخصی رخ داد.', 500);
}
