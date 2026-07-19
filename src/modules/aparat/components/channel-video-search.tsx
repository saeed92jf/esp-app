// src/components/aparat/channel-video-search.tsx
'use client';

import { useCallback } from 'react';

import type { VideoListItem } from "../types";
import { SearchPopup } from '@/components/features/search/search-popup';
import { VideoSearchResult } from './video-search-result';

interface ChannelVideoSearchProps {
  /** The channel's loaded videos to search within. */
  videos: VideoListItem[];
  /** Fired when a result row is chosen; jumps the player to that video. */
  onSelect: (video: VideoListItem) => void;
  className?: string;
}

/**
 * ChannelVideoSearch
 * ----------------------------------------------------------------------------
 * Thin, video-specific adapter over the generic <SearchPopup>. It owns the
 * memoized callbacks so the popup's internal filter memo is never invalidated
 * on parent re-renders, and it renders <VideoSearchResult> so each match shows
 * the thumbnail, title, and metadata (duration / views / date).
 *
 * Note: <SearchPopup> reads its own UI strings via useTranslations('Search'),
 * so NO `messages` prop is passed here.
 */
export function ChannelVideoSearch({
  videos,
  onSelect,
  className,
}: ChannelVideoSearchProps) {
  // Stable unique key per video for React keys + de-duplication in the popup.
  const getItemKey = useCallback((video: VideoListItem) => video.id, []);

  // Match the query against the video title AND the channel handle. Returns an
  // ARRAY of fields â€” the popup ignores null/empty entries.
  const getSearchableText = useCallback(
    (video: VideoListItem): Array<string | null | undefined> => [
      video.title,
      video.username,
    ],
    [],
  );

  // Rich result row: thumbnail + highlighted title + metadata, owned by
  // <VideoSearchResult>. `query` is forwarded for match highlighting.
  const renderItem = useCallback(
    (video: VideoListItem, query: string) => (
      <VideoSearchResult video={video} query={query} />
    ),
    [],
  );

  return (
    <SearchPopup<VideoListItem>
      items={videos}
      getItemKey={getItemKey}
      getSearchableText={getSearchableText}
      renderItem={renderItem}
      onSelect={onSelect}
      minQueryLength={2}
      className={className}
    />
  );
}

