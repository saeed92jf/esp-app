// src/hooks/use-aparat-channel.ts
// ─────────────────────────────────────────────────────────────────────────────
// همان نسخه بهینه‌شده قبلی (AbortController واقعی، O(1) dedup، prefetch)
// با یک تغییر: به‌جای import مستقیم aparatApi از services/aparat-api،
// از api.aparat در لایه یکپارچه استفاده می‌کند.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/services';
import type { Category, Profile, VideoListItem } from '@/types';

const RANDOM_COUNT = 12;
const RESAMPLE_EVERY = 50;

function sample<T>(source: readonly T[], count: number): T[] {
  const copy = source.slice();
  const limit = Math.min(count, copy.length);
  for (let i = copy.length - 1; i > copy.length - 1 - limit; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(copy.length - limit);
}

export interface UseAparatChannelResult {
  channel: Profile | null;
  videos: VideoListItem[];
  categories: Category[];
  randomVideos: VideoListItem[];
  selectedVideo: VideoListItem | null;
  showContent: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  selectVideo: (video: VideoListItem) => void;
  loadMore: () => void;
}

export function useAparatChannel(username: string): UseAparatChannelResult {
  const [channel, setChannel] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [randomVideos, setRandomVideos] = useState<VideoListItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoListItem | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController>(new AbortController());
  const iteratorRef = useRef<AsyncGenerator<VideoListItem[]> | null>(null);
  const inFlightRef = useRef(false);
  const seenIdsRef = useRef<Set<number>>(new Set());
  const pendingPageRef = useRef<Promise<IteratorResult<VideoListItem[]>> | null>(null);
  const lastSampleCountRef = useRef(0);

  const appendVideos = useCallback((next: VideoListItem[]) => {
    const fresh = next.filter((v) => !seenIdsRef.current.has(v.id));
    if (fresh.length === 0) return;
    fresh.forEach((v) => seenIdsRef.current.add(v.id));
    setVideos((prev) => prev.concat(fresh));
  }, []);

  const prefetchNextPage = useCallback(() => {
    const iterator = iteratorRef.current;
    const { signal } = abortRef.current;
    if (!iterator || signal.aborted || pendingPageRef.current) return;
    // پرواز و فراموشی — اما .catch تا rejection بی‌صاحب React را پر سر و صدا نکند
    pendingPageRef.current = iterator.next().catch((err) => {
      pendingPageRef.current = null;
      throw err;
    });
  }, []);

  const pullNextPage = useCallback(async (): Promise<boolean> => {
    const iterator = iteratorRef.current;
    const { signal } = abortRef.current;
    if (!iterator || inFlightRef.current || signal.aborted) return false;

    inFlightRef.current = true;
    try {
      const promise = pendingPageRef.current ?? iterator.next();
      pendingPageRef.current = null;
      const { value, done } = await promise;

      if (iteratorRef.current !== iterator || signal.aborted) return false;

      if (done) {
        setHasMore(false);
        return false;
      }
      if (value?.length) {
        appendVideos(value);
        prefetchNextPage();
      }
      return true;
    } catch (err) {
      // اگر prefetch لغو شده بود، این یک abort عادی است — خطا نشان نده
      if (err instanceof DOMException && err.name === 'AbortError') return false;
      throw err;
    } finally {
      if (iteratorRef.current === iterator) inFlightRef.current = false;
    }
  }, [appendVideos, prefetchNextPage]);

  const loadMore = useCallback(() => {
    const { signal } = abortRef.current;
    if (inFlightRef.current || !hasMore || signal.aborted) return;

    setIsLoadingMore(true);
    void pullNextPage().finally(() => {
      if (!abortRef.current.signal.aborted) setIsLoadingMore(false);
    });
  }, [hasMore, pullNextPage]);

  const selectVideo = useCallback((video: VideoListItem) => {
    setSelectedVideo(video);
  }, []);

  useEffect(() => {
    if (videos.length === 0) return;
    if (
      lastSampleCountRef.current === 0 ||
      videos.length - lastSampleCountRef.current >= RESAMPLE_EVERY
    ) {
      lastSampleCountRef.current = videos.length;
      setRandomVideos(sample(videos, RANDOM_COUNT));
    }
  }, [videos]);

  useEffect(() => {
    setSelectedVideo((current) => current ?? videos[0] ?? null);
  }, [videos]);

  useEffect(() => {
    if (!username) return;

    // ابتدا کنترلر قبلی را با reason صریح لغو کن تا کنسول console error ندهد
    abortRef.current.abort(new DOMException('Channel changed', 'AbortError'));
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    inFlightRef.current = false;
    seenIdsRef.current = new Set();
    pendingPageRef.current = null;
    lastSampleCountRef.current = 0;
    iteratorRef.current = api.aparat.streamUserVideos(username, signal);

    setChannel(null);
    setVideos([]);
    setCategories([]);
    setRandomVideos([]);
    setSelectedVideo(null);
    setShowContent(false);
    setIsLoadingMore(false);
    setHasMore(true);
    setError(null);

    const bootstrap = async () => {
      try {
        const [profile, channelCategories] = await Promise.all([
          api.aparat.getProfile(username, signal),
          api.aparat.getCategories(username, signal),
        ]);

        if (signal.aborted) return;
        setChannel(profile);
        setCategories(channelCategories);

        await pullNextPage();

        if (signal.aborted) return;
        setShowContent(true);
      } catch (err) {
        if (signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری کانال آپارات.');
        setShowContent(true);
      }
    };

    void bootstrap();

    return () => {
      abortRef.current.abort(new DOMException('Unmounted', 'AbortError'));
    };
  }, [username, pullNextPage]);

  return {
    channel, videos, categories, randomVideos, selectedVideo,
    showContent, isLoadingMore, hasMore, error, selectVideo, loadMore,
  };
}
