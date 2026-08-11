"use client";

import Image from "next/image";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Calendar, Eye, PlayCircle } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib/utils";
import type { PlaylistProps, VideoListItem } from "../types";
import { formatViews, formatRelativeTime } from "../utils/formatters";

export function Playlist({
  videos,
  currentVideoId,
  onVideoSelect,
  className,
}: PlaylistProps & { className?: string }) {
  const t = useTranslations("Aparat.Playlist");
  const tr = useTranslations("Aparat.time");

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: videos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88, // estimated height of each row in px (padding + content)
    overscan: 5,
  });

  // Scroll to active index on mount or when currentVideoId changes
  React.useEffect(() => {
    const activeIndex = videos.findIndex((v) => v.id === currentVideoId);
    if (activeIndex !== -1) {
      virtualizer.scrollToIndex(activeIndex, { align: "auto" });
    }
  }, [currentVideoId, videos, virtualizer]);

  return (
    <div
      className={cn(
        "bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm",
        className,
      )}
    >
      <div className="border-b px-4 py-3">
        <h3 className="flex items-center gap-2 font-bold">
          <PlayCircle className="text-primary size-5" />
          {t("title")}
          <span className="text-muted-foreground text-xs font-normal">
            ({t("count", { count: videos.length })})
          </span>
        </h3>
      </div>

      <div
        ref={parentRef}
        className="max-h-150 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar"
      >
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const video = videos[virtualRow.index];
            if (!video) return null;

            const isActive = currentVideoId === video.id;
            const timeAgo = formatRelativeTime(
              video.createdAtTimestamp,
              tr,
              video.sdate,
            );

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="pb-2" // gap equivalent
              >
                <div
                  onClick={() => onVideoSelect(video)}
                  className={cn(
                    "group relative flex h-full cursor-pointer gap-3 rounded-lg p-2 transition-all hover:bg-muted/50",
                    isActive &&
                      "bg-primary/10 ring-1 ring-primary/20 hover:bg-primary/15",
                  )}
                >
                  <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-muted">
                    {video.small_poster ? (
                      <Image
                        src={video.small_poster}
                        alt={video.title}
                        fill
                        sizes="128px"
                        loading="lazy"
                        className="object-cover"
                      />
                    ) : null}
                    {isActive && (
                      <div className="bg-primary/60 absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
                        <PlayCircle className="size-8 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <h4
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
