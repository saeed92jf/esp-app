// src/services/core/http.ts
// ─────────────────────────────────────────────────────────────────────────────
// وقتی به real server متصل می‌شی، فقط baseUrl در index.ts عوض می‌شه.
// این فایل خودش auth header، retry و error normalization را مدیریت می‌کند.

import { ApiError, toApiError, type ErrorCode } from './errors';
import { AUTH_TOKEN_KEY } from './types';

const TIMEOUT_MS  = 12_000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 500; // ms — double each retry

// ─── کمک‌کننده‌های درونی ──────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(AUTH_TOKEN_KEY); } catch { return null; }
}

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

// ─── HTTP Client ──────────────────────────────────────────────────────────────

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  // ── متد پایه ──────────────────────────────────────────────────────────────

  async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
      signal?: AbortSignal;
      auth?: boolean;        // پیش‌فرض: true
      revalidate?: number;   // ثانیه — برای Next.js Data Cache
    } = {},
  ): Promise<T> {
    const { body, params, signal, auth = true, revalidate } = options;

    // ساخت URL با query params
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v));
      });
    }

    // ساخت headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    // retry loop
    let lastError: ApiError | undefined;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const ac = new AbortController();
      const timeoutId = setTimeout(() => ac.abort(new DOMException('Timeout', 'TimeoutError')), TIMEOUT_MS);
      signal?.addEventListener('abort', () => ac.abort(signal.reason), { once: true });

      try {
        const res = await fetch(url.toString(), {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: ac.signal,
          // Next.js Data Cache (فقط در GET فعال است)
          ...(method === 'GET' && revalidate !== undefined
            ? { next: { revalidate } }
            : {}),
        });

        clearTimeout(timeoutId);

        // خطای HTTP
        if (!res.ok) {
          const payload = await res.json().catch(() => ({})) as Record<string, unknown>;
          const code = (payload.code as ErrorCode) ?? 'UNKNOWN';
          const message = (payload.message as string) ?? `HTTP ${res.status}`;
          const details = payload.details as Record<string, string[]> | undefined;
          const err = new ApiError(code, message, res.status, details);

          if (isRetryable(res.status) && attempt < MAX_RETRIES) {
            lastError = err;
            await sleep(RETRY_DELAY * Math.pow(2, attempt));
            continue;
          }
          throw err;
        }

        // پاسخ موفق — بدون body (204)
        if (res.status === 204) return undefined as T;

        const json = await res.json() as { data?: T };
        // اگر سرور envelope دارد ({ data: ... }) → data را برگردان
        // اگر ندارد → کل json را برگردان
        return ('data' in json ? json.data : json) as T;

      } catch (err) {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', () => {});

        const apiErr = toApiError(err);
        if (apiErr.code === 'TIMEOUT' || apiErr.code === 'NETWORK_ERROR') {
          if (attempt < MAX_RETRIES) {
            lastError = apiErr;
            await sleep(RETRY_DELAY * Math.pow(2, attempt));
            continue;
          }
        }
        throw apiErr;
      }
    }

    throw lastError ?? new ApiError('UNKNOWN', 'درخواست ناموفق بود.');
  }

  // ── shorthandها ───────────────────────────────────────────────────────────

  get<T>(path: string, opts?: Parameters<HttpClient['request']>[2]) {
    return this.request<T>('GET', path, opts);
  }
  post<T>(path: string, body?: unknown, opts?: Parameters<HttpClient['request']>[2]) {
    return this.request<T>('POST', path, { ...opts, body });
  }
  patch<T>(path: string, body?: unknown, opts?: Parameters<HttpClient['request']>[2]) {
    return this.request<T>('PATCH', path, { ...opts, body });
  }
  put<T>(path: string, body?: unknown, opts?: Parameters<HttpClient['request']>[2]) {
    return this.request<T>('PUT', path, { ...opts, body });
  }
  delete<T>(path: string, opts?: Parameters<HttpClient['request']>[2]) {
    return this.request<T>('DELETE', path, opts);
  }
}
