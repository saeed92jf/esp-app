"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { aparatApi } from "@/services/aparat-api";
import type { Category, Profile, VideoListItem } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const RANDOM_COUNT = 12;
const RESAMPLE_EVERY = 50; // ✅ correct value

// ─── Sample helper ───────────────────────────────────────────────────────────

function sample<T>(source: readonly T[], count: number): T[] {
  const copy = source.slice();
  const limit = Math.min(count, copy.length);

  for (let i = copy.length - 1; i > copy.length - 1 - limit; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(copy.length - limit);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAparatChannel(username: string) {
  const [channel, setChannel] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [randomVideos, setRandomVideos] = useState<VideoListItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoListItem | null>(
    null,
  );
  const [showContent, setShowContent] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Refs ────────────────────────────────────────────────────────────────

  const abortRef = useRef<AbortController>(new AbortController());
  const iteratorRef = useRef<AsyncGenerator<VideoListItem[]> | null>(null);
  const inFlightRef = useRef(false);

  // ✅ id is string in our project
  const seenIdsRef = useRef<Set<number>>(new Set());

  const pendingPageRef = useRef<Promise<
    IteratorResult<VideoListItem[]>
  > | null>(null);

  const lastSampleCountRef = useRef(0);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const appendVideos = useCallback((next: VideoListItem[]) => {
    const fresh: VideoListItem[] = [];

    for (const v of next) {
      if (!seenIdsRef.current.has(v.id)) {
        seenIdsRef.current.add(v.id);
        fresh.push(v); // ✅ already normalized in API layer
      }
    }

    if (fresh.length === 0) return;

    setVideos((prev) => prev.concat(fresh));
  }, []);

  const prefetchNextPage = useCallback(() => {
    const iterator = iteratorRef.current;
    const { signal } = abortRef.current;

    if (!iterator || signal.aborted || pendingPageRef.current) return;

    pendingPageRef.current = iterator.next();
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

      if (iteratorRef.current !== iterator || signal.aborted) {
        return false;
      }

      if (done) {
        setHasMore(false);
        return false;
      }

      if (value?.length) {
        appendVideos(value);
        prefetchNextPage();
      }

      return true;
    } finally {
      if (iteratorRef.current === iterator) {
        inFlightRef.current = false;
      }
    }
  }, [appendVideos, prefetchNextPage]);

  const loadMore = useCallback(() => {
    const { signal } = abortRef.current;

    if (inFlightRef.current || !hasMore || signal.aborted) return;

    setIsLoadingMore(true);

    void pullNextPage().finally(() => {
      if (!abortRef.current.signal.aborted) {
        setIsLoadingMore(false);
      }
    });
  }, [hasMore, pullNextPage]);

  const selectVideo = useCallback((video: VideoListItem) => {
    setSelectedVideo(video);
  }, []);

  // ── Random rail (optimized) ────────────────────────────────────────────

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

  // ── Default selection ──────────────────────────────────────────────────

  useEffect(() => {
    setSelectedVideo((current) => current ?? videos[0] ?? null);
  }, [videos]);

  // ── Channel change ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!username) return;

    abortRef.current.abort();
    abortRef.current = new AbortController();

    const { signal } = abortRef.current;

    inFlightRef.current = false;
    seenIdsRef.current = new Set();
    pendingPageRef.current = null;
    lastSampleCountRef.current = 0;

    iteratorRef.current = aparatApi.streamUserVideos(username, signal);

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
          aparatApi.getProfile(username, signal),
          aparatApi.getCategories(username, signal),
        ]);

        if (signal.aborted) return;

        setChannel(profile);
        setCategories(channelCategories);

        await pullNextPage();

        if (!signal.aborted) {
          setShowContent(true);
        }
      } catch (err) {
        if (signal.aborted) return;

        setError(
          err instanceof Error ? err.message : "خطا در بارگذاری کانال آپارات.",
        );

        setShowContent(true);
      }
    };

    void bootstrap();

    return () => {
      abortRef.current.abort();
    };
  }, [username, pullNextPage]);

  // ── Return ──────────────────────────────────────────────────────────────

  return {
    channel,
    videos,
    categories,
    randomVideos,
    selectedVideo,
    showContent,
    isLoadingMore,
    hasMore,
    error,
    selectVideo,
    loadMore,
  };
}
