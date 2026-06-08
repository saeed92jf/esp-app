/* src/components/playlist.tsx */
'use client';

import Image from 'next/image';
// Pull locale directly from next-intl instead of reading it from a translated string.
import { useTranslations, useLocale } from 'next-intl';
import { useDeferredValue } from 'react';
import { Calendar, Eye, Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PlaylistProps, VideoListItem } from '@/types';
import { formatDuration, formatViews, formatDate } from '@/utils/aparatUtils';

export function Playlist({
  videos,
  currentVideoId,
  onVideoSelect,
  title,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: PlaylistProps) {
  // All user-facing strings for this component live under the "Aparat" namespace.
  const t = useTranslations('Aparat.Playlist');

  // Real BCP 47 locale tag (e.g. "fa-IR", "en-US") provided by next-intl.
  // This is the value Intl.NumberFormat expects — never a translated word.
  const locale = useLocale();

  // Defer the list value: when the background auto-loader appends new pages,
  // React renders the larger list at a lower priority. This keeps clicks and
  // scrolling responsive instead of janking on every batch that arrives.
  const deferredVideos = useDeferredValue(videos);

  // Empty state: only show it once we truly have nothing AND nothing is
  // still streaming in, so we don't flash "empty" during the first load.
  if (deferredVideos.length === 0 && !isLoadingMore) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-center text-sm">
        {t('empty')}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Header stays fixed at the top; it must NOT shrink. */}
      {/* Note: the numeric "count" line was intentionally removed. */}
      <div className="shrink-0 border-b px-4 py-3">
        <h2 className="text-foreground text-sm font-semibold">
          {title ?? t('title')}
        </h2>
      </div>

      {/* Scrollable list area. */}
      <ScrollArea className="min-h-0 flex-1">
        <ul className="divide-y">
          {deferredVideos.map((video: VideoListItem) => {
            const isActive = currentVideoId === video.id;

            return (
              <li key={video.id}>
                <button
                  type="button"
                  onClick={() => onVideoSelect(video)}
                  // Each row aligns its text based on the precomputed title direction.
                  dir={video.titleDir}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-start transition-colors',
                    'hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none',
                    isActive && 'bg-accent',
                  )}
                >
                  {/* Thumbnail with duration badge and active overlay. */}
                  <div className="bg-muted relative aspect-video w-28 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={video.small_poster}
                      alt={video.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />

                    {/* Duration badge, bottom-end corner. */}
                    <span className="absolute inset-e-1 bottom-1 rounded bg-black/75 px-1 py-0.5 text-[10px] font-medium text-white">
                      {formatDuration(video.duration)}
                    </span>

                    {/* Play overlay shown only for the active video. */}
                    {isActive && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-5 w-5 fill-white text-white" />
                      </span>
                    )}
                  </div>

                  {/* Textual metadata: title, views, date. */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className={cn(
                        'line-clamp-2 text-sm leading-snug',
                        isActive
                          ? 'text-foreground font-semibold'
                          : 'text-foreground/90',
                      )}
                    >
                      {video.title}
                    </h3>

                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      {/* Localized view count. */}
                      <span>
                        {formatViews(video.visit_cnt)} {t('views')}
                      </span>
                      <span>
                        <Eye className="size-4" />
                      </span>
                      <span aria-hidden>•</span>
                      <Calendar className="size-3" />
                      {formatDate(video.sdate)}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Footer area: Load More button while more pages exist. */}
        {hasMore && (
          <div className="p-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('loadMore')}
                </>
              ) : (
                t('loadMore')
              )}
            </Button>
          </div>
        )}

        {/* Subtle hint when the background auto-loader is fetching but the
            Load More button is hidden (e.g. last silent fill in progress). */}
        {!hasMore && isLoadingMore && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 p-3 text-xs">
            <Loader2 className="size-3.5 animate-spin" />
            {t('loadMore')}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default Playlist;
