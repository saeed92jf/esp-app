/* src/hook/use-aparat-channel.ts */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { aparatApi } from '@/services/aparat-api';
import type { Category, ChannelInfo, Profile, VideoListItem } from '@/types';

// Number of videos sampled for the "random / suggested" rail.
const RANDOM_COUNT = 12;

/**
 * Return a random sample of `count` items using a Fisher-Yates shuffle on a
 * shallow copy. The source array is never mutated.
 */
function sample<T>(source: readonly T[], count: number): T[] {
  const copy = source.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

export interface UseAparatChannelResult {
  /** Channel profile (avatar, name, ...) resolved from `getProfile`. */
  channel: Profile | null;
  /** All videos loaded so far across paginated stream pulls. */
  videos: VideoListItem[];
  /** Channel categories used to build the category tabs. */
  categories: Category[];
  /** A random subset of `videos` for the suggested rail. */
  randomVideos: VideoListItem[];
  /** Currently selected video for the player. */
  selectedVideo: VideoListItem | null;
  /** True once the first page is ready and content can be revealed. */
  showContent: boolean;
  /** True while a background "load more" pull is in flight. */
  isLoadingMore: boolean;
  /** False once the stream is exhausted. */
  hasMore: boolean;
  /** Last error message, if any. */
  error: string | null;
  /** Imperatively select a video for the player. */
  selectVideo: (video: VideoListItem) => void;
  /** Manually request the next page (e.g. on scroll / "load more"). */
  loadMore: () => void;
}

/**
 * Loads and paginates an Aparat channel by username.
 *
 * Concurrency safety: the live iterator identity (`iteratorRef.current`) is
 * the single source of truth. Any page that resolves after the channel has
 * switched is discarded by comparing identities post-await.
 *
 * Purity note: de-duplication is computed *inside* the `setVideos` updater
 * from the current array (no external ref mutation), so the updater stays
 * pure and behaves correctly under React Strict Mode's double-invocation.
 */
export function useAparatChannel(username: string): UseAparatChannelResult {
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

  // Active async generator for the current channel's video stream.
  const iteratorRef = useRef<AsyncGenerator<VideoListItem[]> | null>(null);
  // Cancellation flag passed into the stream; flipped true on cleanup.
  const cancelledRef = useRef(false);
  // Prevents overlapping pulls from the same stream.
  const inFlightRef = useRef(false);

  /**
   * Append a page of videos. De-duplication is derived from the current
   * array on each call, keeping this updater pure (no external side effects),
   * which is required for correct behavior under Strict Mode.
   */
  const appendVideos = useCallback((next: VideoListItem[]) => {
    setVideos((current) => {
      // Build the seen-set from the CURRENT list every time -> pure updater.
      const seen = new Set<string | number>(current.map((v) => v.id));
      const fresh: VideoListItem[] = [];
      for (const video of next) {
        if (seen.has(video.id)) continue;
        seen.add(video.id);
        fresh.push(video);
      }
      return fresh.length === 0 ? current : current.concat(fresh);
    });
  }, []);

  /**
   * Pull exactly one page from the stream. Returns false when the stream is
   * exhausted (or the page belongs to a stale channel) so callers know to
   * stop.
   */
  const pullNextPage = useCallback(async (): Promise<boolean> => {
    const iterator = iteratorRef.current;
    if (!iterator || inFlightRef.current || cancelledRef.current) return false;

    inFlightRef.current = true;
    try {
      const { value, done } = await iterator.next();

      // The channel may have switched while awaiting this page. The live
      // iterator identity is the source of truth: if it no longer matches,
      // this page belongs to a previous channel and MUST be discarded.
      if (iteratorRef.current !== iterator) return false;

      if (done) {
        setHasMore(false);
        return false;
      }
      if (value && value.length > 0) {
        appendVideos(value);
      }
      return true;
    } finally {
      // Only release the guard if we are still the active iterator; otherwise
      // the new channel has already taken ownership of it.
      if (iteratorRef.current === iterator) {
        inFlightRef.current = false;
      }
    }
  }, [appendVideos]);

  /**
   * Manual pagination trigger (scroll / "load more" button). Shows the
   * loading indicator while the page is being pulled.
   */
  const loadMore = useCallback(() => {
    if (inFlightRef.current || !hasMore || cancelledRef.current) return;
    setIsLoadingMore(true);
    void pullNextPage().finally(() => {
      // Ignore the indicator update if the channel was switched mid-flight.
      if (!cancelledRef.current) setIsLoadingMore(false);
    });
  }, [hasMore, pullNextPage]);

  /** Imperatively select a video for the player. */
  const selectVideo = useCallback((video: VideoListItem) => {
    setSelectedVideo(video);
  }, []);

  // Derive the suggested rail from the full, de-duplicated video list.
  // Kept in a dedicated effect so the `setVideos` updater stays pure.
  useEffect(() => {
    setRandomVideos(sample(videos, RANDOM_COUNT));
  }, [videos]);

  // Default the player to the newest video (first item) once videos arrive,
  // and only while nothing has been selected yet. Centralizing the default
  // selection here prevents the client from racing the hook for ownership.
  useEffect(() => {
    setSelectedVideo((current) => current ?? videos[0] ?? null);
  }, [videos]);

  // Load profile, categories, and the first video page whenever the channel
  // changes. Fully resets all state so no data from the previous channel can
  // bleed into the new one.
  useEffect(() => {
    if (!username) return;

    cancelledRef.current = false;
    const isCancelled = () => cancelledRef.current;

    // Take ownership of the in-flight guard for the new channel so a still
    // pending pull from the previous channel cannot block the first page.
    inFlightRef.current = false;
    iteratorRef.current = aparatApi.streamUserVideos(username, isCancelled);

    // Reset all state when the channel changes.
    setChannel(null);
    setVideos([]);
    setCategories([]);
    setRandomVideos([]);
    setSelectedVideo(null);
    setShowContent(false);
    setIsLoadingMore(false);
    setHasMore(true);
    setError(null);

    let active = true;

    const bootstrap = async () => {
      try {
        // Fetch profile and categories in parallel; both require the username.
        const [profile, channelCategories] = await Promise.all([
          aparatApi.getProfile(username),
          aparatApi.getCategories(username),
        ]);

        if (!active || cancelledRef.current) return;
        setChannel(profile);
        setCategories(channelCategories);

        // Pull the first page so the UI has something to render immediately.
        await pullNextPage();

        if (!active || cancelledRef.current) return;
        setShowContent(true);
      } catch (err) {
        if (!active || cancelledRef.current) return;
        setError(
          err instanceof Error ? err.message : 'خطا در بارگذاری کانال آپارات.',
        );
        // Reveal content so the error state can be shown instead of a spinner.
        setShowContent(true);
      }
    };

    void bootstrap();

    return () => {
      active = false;
      // Signal the stream to stop. The real stale-page protection lives in
      // the iterator-identity check inside pullNextPage.
      cancelledRef.current = true;
    };
  }, [username, pullNextPage]);

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
