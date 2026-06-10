"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Calendar, Eye, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlaylistProps, VideoListItem } from "@/types";
import { formatViews, formatRelativeTime } from "@/utils/aparatUtils";

/**
 * Playlist component to display a list of videos with a scrollable area.
 * It strictly follows the PlaylistProps defined in @/types/index.ts
 */
export function Playlist({
  videos,
  currentVideoId,
  onVideoSelect,
  className,
}: PlaylistProps & { className?: string }) {
  const t = useTranslations("Aparat.Playlist");
  const tr = useTranslations("Aparat.time");

  // Scroll to active video on mount or when currentVideoId changes
  const activeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentVideoId]);

  return (
    <div
      className={cn(
        "bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h3 className="flex items-center gap-2 font-bold">
          <PlayCircle className="text-primary size-5" />
          {t("title") || "لیست پخش"}
          <span className="text-muted-foreground text-xs font-normal">
            ({t("count", { count: videos.length })})
          </span>
        </h3>
      </div>

      {/* Scrollable List */}
      <div className="max-h-150 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
        <div className="flex flex-col gap-2">
          {videos.map((video: VideoListItem) => {
            const isActive = currentVideoId === video.id;
            const timeAgo = formatRelativeTime(video.createdAtTimestamp, tr);

            return (
              <div
                key={video.id}
                ref={isActive ? activeRef : null}
                onClick={() => onVideoSelect(video)}
                className={cn(
                  "group relative flex cursor-pointer gap-3 rounded-lg p-2 transition-all hover:bg-muted/50",
                  isActive &&
                    "bg-primary/10 ring-1 ring-primary/20 hover:bg-primary/15",
                )}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    src={video.small_poster}
                    alt={video.title}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                  {isActive && (
                    <div className="bg-primary/60 absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
                      <PlayCircle className="size-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <h4
                    dir={video.titleDir}
                    className={cn(
                      "text-foreground line-clamp-2 text-sm font-medium leading-snug transition-colors",
                      isActive && "text-primary",
                    )}
                  >
                    {video.title}
                  </h4>

                  <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" />
                      {formatViews(video.visit_cnt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {timeAgo}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
