// src/services/aparat-api.ts
//
// تغییرات نسبت به نسخه قبل:
//
//  1. AbortSignal — همه متدها یک signal اختیاری می‌گیرند. وقتی کانال عوض
//     می‌شود یا component unmount می‌شود، request های در حال پرواز واقعاً
//     لغو می‌شوند (نه فقط نتیجه‌شان نادیده گرفته می‌شود).
//
//  2. Retry با exponential backoff — خطاهای گذرا (شبکه، ۵xx، ۴۲۹)
//     تا MAX_RETRIES بار با تأخیر ۵۰۰ms → ۱۰۰۰ms دوباره امتحان می‌شوند.
//
//  3. Timeout — هر request بعد از REQUEST_TIMEOUT_MS لغو می‌شود.
//
//  4. ایمنی type — index signature [x: string]: any حذف شد.

import { withTitleDirection } from "@/utils/textDirection";
import type { Category, Profile, VideoItem, VideoListItem } from "@/types";
import { parseAparatDateToTimestamp } from "@/utils/dateParser";

// ─── ثابت‌ها ─────────────────────────────────────────────────────────────────

const PROXY_BASE = "/api/aparat";
const PER_PAGE = 50;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 20;
const BACKOFF_BASE_MS = 500;

// ─── ابزارهای درونی ──────────────────────────────────────────────────────────

/** آیا خطا از نوع Abort/Cancel است؟ */
function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "AbortError" || err.name === "TimeoutError")
  );
}

/** آیا خطا گذراست و ارزش retry دارد؟ */
function isTransient(err: unknown, status?: number): boolean {
  if (err instanceof TypeError) return true; // خطای شبکه
  if (status !== undefined && (status >= 500 || status === 429)) return true;
  return false;
}

/** انتظار با قابلیت لغو از طریق signal. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted)
      return reject(new DOMException("Aborted", "AbortError"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

/**
 * fetch پایه با timeout + retry + AbortSignal.
 * نتیجه از Next.js Data Cache برمی‌گردد (عملاً رایگان وقتی cache گرم است).
 */
async function proxyGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${PROXY_BASE}/${path}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    // یک AbortController مجزا برای ترکیب signal کاربر + timeout
    const ac = new AbortController();
    const timeoutId = setTimeout(
      () => ac.abort(new DOMException("Timeout", "TimeoutError")),
      REQUEST_TIMEOUT_MS,
    );
    const onExternalAbort = () => ac.abort(signal!.reason);
    signal?.addEventListener("abort", onExternalAbort, { once: true });

    let status: number | undefined;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: ac.signal,
      });
      status = res.status;

      if (!res.ok) {
        if (isTransient(null, status) && attempt < MAX_RETRIES) {
          await sleep(BACKOFF_BASE_MS * (attempt + 1), signal);
          continue;
        }
        throw new Error(`Aparat API error: ${path} (${status})`);
      }

      return (await res.json()) as T;
    } catch (err) {
      if (isAbortError(err)) throw err; // هرگز abort را retry نکن
      if (isTransient(err, status) && attempt < MAX_RETRIES) {
        await sleep(BACKOFF_BASE_MS * (attempt + 1), signal);
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onExternalAbort);
    }
  }

  // این خط اجرا نمی‌شود اما TypeScript به آن نیاز دارد
  throw new Error(`Failed after ${MAX_RETRIES + 1} attempts: ${path}`);
}

// ─── توابع کمکی parse پاسخ Aparat ───────────────────────────────────────────

/**
 * Aparat key‌ها را با casing ناهماهنگ برمی‌گرداند (videoByUser → videobyuser).
 * این تابع case-insensitive جستجو می‌کند و هم شکل object ساده و هم
 * array-wrapped را پشتیبانی می‌کند.
 */
function pickKey<T = unknown>(data: unknown, key: string): T | undefined {
  const target = key.toLowerCase();

  const fromObject = (obj: Record<string, unknown>): T | undefined => {
    const k = Object.keys(obj).find((k) => k.toLowerCase() === target);
    return k ? (obj[k] as T) : undefined;
  };

  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === "object") {
        const v = fromObject(item as Record<string, unknown>);
        if (v !== undefined) return v;
      }
    }
    return undefined;
  }

  if (data && typeof data === "object") {
    return fromObject(data as Record<string, unknown>);
  }

  return undefined;
}

function pickNextPageUrl(data: unknown): unknown {
  const ui = pickKey<Record<string, unknown>>(data, "ui");
  return ui?.pagingForward;
}

/**
 * URL کامل Aparat را به path مختصر proxy تبدیل می‌کند.
 * مثال: https://www.aparat.com/etc/api/videoByUser/... → videoByUser/...
 */
function endpointFromAparatUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url.trim()) return null;
  const marker = "/etc/api/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length).trim() || null;
}

// ─── توابع coerce ─────────────────────────────────────────────────────────────

function toInt(value: unknown): number {
  if (typeof value === "number") return Math.trunc(value);
  if (typeof value === "string") {
    const d = value.replace(/\D/g, "");
    return d ? parseInt(d, 10) : 0;
  }
  return 0;
}

function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "yes" || v === "true" || v === "1";
  }
  return false;
}

// ─── نرمال‌سازی داده ویدئو ────────────────────────────────────────────────────
function normalizeVideo(
  raw: Record<string, unknown>,
  categoryName = "Uncategorized",
): VideoListItem {
  const sdate = String(raw.sdate ?? "");

  return withTitleDirection({
    id: toInt(raw.id),
    uid: String(raw.uid ?? ""),
    title: String(raw.title ?? ""),
    username: String(raw.username ?? raw.sender_name ?? ""),
    userid: toInt(raw.userid),
    visit_cnt: toInt(raw.visit_cnt),
    process: String(raw.process ?? ""),
    small_poster: String(raw.small_poster ?? ""),
    big_poster: String(raw.big_poster ?? ""),
    duration: toInt(raw.duration),

    sdate,

    // ✅ required field
    createdAtTimestamp: parseAparatDateToTimestamp(sdate),

    frame: String(raw.frame ?? ""),
    official: String(raw.official ?? "no"),
    autoplay: toBool(raw.autoplay),
    "360d": toBool(raw["360d"]),

    categoryId: raw.cat_id != null ? toInt(raw.cat_id) : undefined,
    categoryName: String(raw.cat_name ?? categoryName),
  });
}

// ─── سرویس اصلی ──────────────────────────────────────────────────────────────

class AparatApiService {
  /**
   * پروفایل کانال.
   * Cache: ۱ ساعت (در API route تنظیم شده).
   */
  async getProfile(username: string, signal?: AbortSignal): Promise<Profile> {
    const data = await proxyGet<unknown>(
      `profile/username/${username}`,
      signal,
    );
    const p = (pickKey<Record<string, unknown>>(data, "profile") ??
      {}) as Record<string, unknown>;

    return {
      username: String(p.username ?? username),
      name: String(p.name ?? username),
      avatar: String(p.pic_b ?? p.pic_m ?? p.pic_s ?? ""),
      followers: toInt(p.follower_cnt),
    };
  }

  /**
   * دسته‌بندی‌های کانال (پلی‌لیست‌ها).
   * Cache: ۳۰ دقیقه.
   */
  async getCategories(
    username: string,
    signal?: AbortSignal,
  ): Promise<Category[]> {
    const data = await proxyGet<unknown>(
      `profilecategories/username/${username}`,
      signal,
    );
    const list =
      pickKey<Record<string, unknown>[]>(data, "profilecategories") ?? [];

    return list.map((c) => {
      const name = String(c.cat_name ?? "Uncategorized");
      return {
        cat_id: toInt(c.cat_id),
        cat_name: name,
        cat_cnt: toInt(c.cat_cnt),
        link: String(c.link ?? ""),
        title: name,
      };
    });
  }

  /**
   * اطلاعات کامل یک ویدئو برای player.
   * Cache: ۱ ساعت.
   */
  async getVideoInfo(uid: string, signal?: AbortSignal): Promise<VideoItem> {
    const data = await proxyGet<unknown>(`video/videohash/${uid}`, signal);
    const v = (pickKey<Record<string, unknown>>(data, "video") ?? {}) as Record<
      string,
      unknown
    >;

    const listItem = normalizeVideo(v, String(v.cat_name ?? "Uncategorized"));
    return {
      ...listItem,
      description: String(v.description ?? ""),
      file_link: String(v.file_link ?? ""),
    };
  }

  /**
   * stream صفحه‌به‌صفحه ویدئوهای کانال.
   * Cache: ۵ دقیقه در API route.
   *
   * با signal پاس‌شده از AbortController، وقتی کانال عوض می‌شود یا
   * component unmount می‌شود، request در حال پرواز واقعاً لغو می‌شود.
   */
  async *streamUserVideos(
    username: string,
    signal: AbortSignal,
  ): AsyncGenerator<VideoListItem[], void, unknown> {
    let nextPath: string | null =
      `videoByUser/username/${username}/perpage/${PER_PAGE}`;

    while (nextPath && !signal.aborted) {
      const data = await proxyGet<unknown>(nextPath, signal);
      const rawVideos =
        pickKey<Record<string, unknown>[]>(data, "videoByUser") ?? [];
      yield rawVideos.map((raw) => normalizeVideo(raw));
      nextPath = endpointFromAparatUrl(pickNextPageUrl(data));
    }
  }

  /**
   * stream ویدئوهای یک دسته‌بندی خاص.
   */
  async *streamCategoryVideos(
    username: string,
    category: Category,
    signal: AbortSignal,
  ): AsyncGenerator<VideoListItem[], void, unknown> {
    let nextPath: string | null =
      `videobyprofilecat/usercat/${category.cat_id}/username/${username}/perpage/${PER_PAGE}`;

    while (nextPath && !signal.aborted) {
      const data = await proxyGet<unknown>(nextPath, signal);
      const rawVideos =
        pickKey<Record<string, unknown>[]>(data, "videobyprofilecat") ?? [];
      yield rawVideos.map((raw) => normalizeVideo(raw, category.cat_name));
      nextPath = endpointFromAparatUrl(pickNextPageUrl(data));
    }
  }
}

export const aparatApi = new AparatApiService();
