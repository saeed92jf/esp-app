// src/services/aparat-api.ts

import { withTitleDirection } from '@/utils/textDirection';
import type { Category, Profile, VideoItem, VideoListItem } from '@/types';

const PROXY_BASE = '/api/aparat';
const PER_PAGE = 50;

/**
 * Low-level fetch against the proxy. Throws on non-OK responses so callers
 * can surface a single, predictable error path.
 */
async function proxyGet<T>(path: string): Promise<T> {
  const res = await fetch(`${PROXY_BASE}/${path}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Aparat proxy request failed: ${path} (${res.status})`);
  }

  return (await res.json()) as T;
}

/**
 * The legacy Aparat (etc/api) responses are NOT case-consistent: a request to
 * `videoByUser` comes back keyed as `videobyuser`. They also arrive either as a
 * single-key object or as an array of single-key objects. This helper resolves
 * a value by key from BOTH shapes using a CASE-INSENSITIVE match, so callers
 * never depend on Aparat's exact casing or wire format.
 */
function pickKey<T = any>(data: unknown, key: string): T | undefined {
  const target = key.toLowerCase();

  /** Find the matching key inside a single object, ignoring case. */
  const readFromObject = (obj: object): T | undefined => {
    const match = Object.keys(obj).find((k) => k.toLowerCase() === target);
    return match ? ((obj as Record<string, unknown>)[match] as T) : undefined;
  };

  // Array-wrapped shape: scan elements for the first that carries the key.
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === 'object') {
        const value = readFromObject(item);
        if (value !== undefined) return value;
      }
    }
    return undefined;
  }

  // Plain-object shape.
  if (data && typeof data === 'object') {
    return readFromObject(data);
  }

  return undefined;
}

/**
 * Resolve the next-page url from the `ui` block, tolerating both the
 * array-wrapped and object response shapes.
 */
function pickNextPageUrl(data: unknown): unknown {
  const ui = pickKey<Record<string, unknown>>(data, 'ui');
  return ui?.pagingForward;
}

/**
 * Convert a full Aparat API url ("https://www.aparat.com/etc/api/...") into
 * the relative path our proxy expects. Returns null when not parseable or
 * empty (Aparat returns '' when there is no next page).
 */
function endpointFromAparatUrl(url: unknown): string | null {
  if (typeof url !== 'string' || url.trim() === '') return null;
  const marker = '/etc/api/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length).trim();
  return path || null;
}

/** Coerce Aparat numeric-ish fields (may be "1,234") to an integer. */
function toInt(value: unknown): number {
  if (typeof value === 'number') return Math.trunc(value);
  if (typeof value === 'string') {
    const digits = value.replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }
  return 0;
}

/** Coerce Aparat truthy fields ("yes"/"1"/true/1) into a boolean. */
function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'yes' || v === 'true' || v === '1';
  }
  return false;
}

/**
 * Normalize one raw Aparat video object into our internal VideoListItem.
 * titleDir is attached here so the UI never recomputes direction at render.
 */
function normalizeVideo(
  raw: any,
  categoryName = 'Uncategorized',
): VideoListItem {
  const base: Omit<VideoListItem, 'titleDir'> = {
    id: toInt(raw.id),
    uid: String(raw.uid ?? ''),
    title: raw.title ?? '',
    username: raw.username ?? raw.sender_name ?? '',
    userid: toInt(raw.userid),
    visit_cnt: toInt(raw.visit_cnt),
    process: raw.process ?? '',
    small_poster: raw.small_poster ?? '',
    big_poster: raw.big_poster ?? '',
    duration: toInt(raw.duration),
    sdate: raw.sdate ?? '',
    frame: raw.frame ?? '',
    official: raw.official ?? 'no',
    autoplay: toBool(raw.autoplay),
    '360d': toBool(raw['360d']),
    categoryId: raw.cat_id != null ? toInt(raw.cat_id) : undefined,
    categoryName: raw.cat_name ?? categoryName,
  };

  return withTitleDirection(base);
}

class AparatApiService {
  [x: string]: any;
  /**
   * Channel profile. Method: profile/username/{username}
   * Payload keyed by "profile" (array- or object-wrapped).
   */
  async getProfile(username: string): Promise<Profile> {
    const data = await proxyGet<any>(`profile/username/${username}`);
    const p = pickKey<any>(data, 'profile') ?? {};

    return {
      username: p.username ?? username,
      name: p.name ?? username,
      avatar: p.pic_b ?? p.pic_m ?? p.pic_s ?? '',
      followers: toInt(p.follower_cnt),
    };
  }

  /**
   * Channel's own categories (playlists).
   * Method: profilecategories/username/{username}
   */
  async getCategories(username: string): Promise<Category[]> {
    const data = await proxyGet<any>(`profilecategories/username/${username}`);
    const list: any[] = pickKey<any[]>(data, 'profilecategories') ?? [];

    return list.map<Category>((c) => {
      const name = c.cat_name ?? 'Uncategorized';
      return {
        cat_id: toInt(c.cat_id),
        cat_name: name,
        cat_cnt: toInt(c.cat_cnt),
        link: c.link ?? '',
        title: name,
      };
    });
  }

  /**
   * Full info for one video (player). Method: video/videohash/{uid}
   */
  async getVideoInfo(uid: string): Promise<VideoItem> {
    const data = await proxyGet<any>(`video/videohash/${uid}`);
    const v = pickKey<any>(data, 'video') ?? {};

    const listItem = normalizeVideo(v, v.cat_name ?? 'Uncategorized');
    return {
      ...listItem,
      description: v.description ?? '',
      // Legacy API plays via `frame`; file_link is best-effort.
      file_link: v.file_link ?? '',
    };
  }

  /**
   * Stream a channel's videos page-by-page.
   * Method: videoByUser/username/{username}/perpage/{n}
   * Next page comes from ui.pagingForward.
   */
  async *streamUserVideos(
    username: string,
    isCancelled: () => boolean,
  ): AsyncGenerator<VideoListItem[], void, unknown> {
    let nextPath: string | null =
      `videoByUser/username/${username}/perpage/${PER_PAGE}`;

    while (nextPath && !isCancelled()) {
      const data: any = await proxyGet<any>(nextPath);
      const rawVideos: any[] = pickKey<any[]>(data, 'videoByUser') ?? [];

      yield rawVideos.map((raw) => normalizeVideo(raw));

      nextPath = endpointFromAparatUrl(pickNextPageUrl(data));
    }
  }

  /**
   * Stream videos of one user category.
   * Method: videobyprofilecat/usercat/{cat_id}/username/{username}/perpage/{n}
   */
  async *streamCategoryVideos(
    username: string,
    category: Category,
    isCancelled: () => boolean,
  ): AsyncGenerator<VideoListItem[], void, unknown> {
    let nextPath: string | null =
      `videobyprofilecat/usercat/${category.cat_id}/username/${username}/perpage/${PER_PAGE}`;

    while (nextPath && !isCancelled()) {
      const data: any = await proxyGet<any>(nextPath);
      const rawVideos: any[] = pickKey<any[]>(data, 'videobyprofilecat') ?? [];

      yield rawVideos.map((raw) => normalizeVideo(raw, category.cat_name));

      nextPath = endpointFromAparatUrl(pickNextPageUrl(data));
    }
  }
}

export const aparatApi = new AparatApiService();
