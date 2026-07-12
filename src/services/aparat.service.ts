// src/services/aparat.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// نسخه هم‌راستا با معماری یکپارچه. منطق قبلی aparat-api.ts حفظ شده،
// فقط در قالب Interface + Fake/Real قرار گرفته تا با بقیه سرویس‌ها یکدست باشد.
//
// نکته: Aparat یک API عمومی واقعی است (نه fake)، پس اینجا "Fake" به‌معنای
// "پیاده‌سازی فعلی از طریق پروکسی داخلی" است — چیزی که از قبل داشتیم و کار می‌کند.
// وقتی به سرور خودمان وصل شویم، می‌توانیم همین endpoint را روی سرور خودمان هم
// پیاده کنیم (RealAparatService) تا caching و rate-limit مرکزی شود.

import { withTitleDirection } from "@/utils/textDirection";
import type { Category, Profile, VideoItem, VideoListItem } from "@/types";
import type { HttpClient } from "./core/http";

const PROXY_BASE = "/api/aparat";
const PER_PAGE = 50;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const BACKOFF_BASE_MS = 500;

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAparatService {
  getProfile(username: string, signal?: AbortSignal): Promise<Profile>;
  getCategories(username: string, signal?: AbortSignal): Promise<Category[]>;
  getVideoInfo(uid: string, signal?: AbortSignal): Promise<VideoItem>;
  streamUserVideos(
    username: string,
    signal: AbortSignal,
  ): AsyncGenerator<VideoListItem[], void, unknown>;
  streamCategoryVideos(
    username: string,
    category: Category,
    signal: AbortSignal,
  ): AsyncGenerator<VideoListItem[], void, unknown>;
}

// ─── کمک‌کننده‌های درونی (مشترک) ──────────────────────────────────────────────

function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "AbortError" || err.name === "TimeoutError")
  );
}
function isTransient(err: unknown, status?: number): boolean {
  if (err instanceof TypeError) return true;
  if (status !== undefined && (status >= 500 || status === 429)) return true;
  return false;
}
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

async function proxyGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${PROXY_BASE}/${path}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

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
      if (isAbortError(err)) throw err;
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
  throw new Error(`Failed after ${MAX_RETRIES + 1} attempts: ${path}`);
}

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
  if (data && typeof data === "object")
    return fromObject(data as Record<string, unknown>);
  return undefined;
}
function pickNextPageUrl(data: unknown): unknown {
  return pickKey<Record<string, unknown>>(data, "ui")?.pagingForward;
}
function endpointFromAparatUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url.trim()) return null;
  const marker = "/etc/api/";
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length).trim() || null;
}
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
function normalizeVideo(
  raw: Record<string, unknown>,
  categoryName = "Uncategorized",
): VideoListItem {
  const sdate = String(raw.sdate ?? "");
  const createdAtTimestamp =
    raw.createdAtTimestamp != null
      ? toInt(raw.createdAtTimestamp)
      : (() => {
          const parsed = Date.parse(sdate);
          return Number.isFinite(parsed) ? parsed : 0;
        })();

  return withTitleDirection({
    createdAtTimestamp,
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
    frame: String(raw.frame ?? ""),
    official: String(raw.official ?? "no"),
    autoplay: toBool(raw.autoplay),
    "360d": toBool(raw["360d"]),
    categoryId: raw.cat_id != null ? toInt(raw.cat_id) : undefined,
    categoryName: String(raw.cat_name ?? categoryName),
  });
}

// ─── پیاده‌سازی فعلی (از طریق پروکسی Next.js) ─────────────────────────────────
// این پیاده‌سازی همیشه استفاده می‌شود — چه در fake mode چه در real mode —
// چون Aparat منبع داده خارجی است، نه بخشی از backend خودمان.

export class AparatService implements IAparatService {
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

// ─── Real (نسخه آینده — اگر بخواهیم proxy را به backend خودمان منتقل کنیم) ────
// فعلاً استفاده نمی‌شود؛ AparatService بالا برای هر دو mode کافی است.
// اگر در آینده خواستیم caching/rate-limit را به سرور خودمان منتقل کنیم:

export class RealAparatService implements IAparatService {
  constructor(private http: HttpClient) {}

  async getProfile(username: string, signal?: AbortSignal): Promise<Profile> {
    return this.http.get<Profile>(`/aparat/profile/${username}`, {
      signal,
      revalidate: 3600,
    });
  }
  async getCategories(
    username: string,
    signal?: AbortSignal,
  ): Promise<Category[]> {
    return this.http.get<Category[]>(`/aparat/categories/${username}`, {
      signal,
      revalidate: 1800,
    });
  }
  async getVideoInfo(uid: string, signal?: AbortSignal): Promise<VideoItem> {
    return this.http.get<VideoItem>(`/aparat/video/${uid}`, {
      signal,
      revalidate: 3600,
    });
  }
  async *streamUserVideos(
    username: string,
    signal: AbortSignal,
  ): AsyncGenerator<VideoListItem[], void, unknown> {
    let page = 1;
    while (!signal.aborted) {
      const res = await this.http.get<{
        items: VideoListItem[];
        hasMore: boolean;
      }>(`/aparat/videos/${username}`, {
        signal,
        params: { page, perPage: PER_PAGE },
      });
      yield res.items;
      if (!res.hasMore) return;
      page += 1;
    }
  }
  async *streamCategoryVideos(
    username: string,
    category: Category,
    signal: AbortSignal,
  ): AsyncGenerator<VideoListItem[], void, unknown> {
    let page = 1;
    while (!signal.aborted) {
      const res = await this.http.get<{
        items: VideoListItem[];
        hasMore: boolean;
      }>(`/aparat/videos/${username}/category/${category.cat_id}`, {
        signal,
        params: { page, perPage: PER_PAGE },
      });
      yield res.items;
      if (!res.hasMore) return;
      page += 1;
    }
  }
}
