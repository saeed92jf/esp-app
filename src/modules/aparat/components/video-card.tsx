"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Eye, Play, VideoOff } from "lucide-react";
import type { VideoItem } from "@/types";
import { cn } from "@/lib/utils";
import {
  formatDuration,
  formatViews,
  formatRelativeTime,
} from "../utils/formatters";
import { useTranslations } from "next-intl";

interface VideoCardProps {
  video: VideoItem;
  isActive?: boolean;
  onClick: () => void;
}

export function VideoCard({ video, isActive, onClick }: VideoCardProps) {
  const [hasError, setHasError] = useState(false);
  const poster = video.small_poster || video.big_poster;
  const showImage = poster && !hasError;
  const tr = useTranslations("Aparat.time");

  // اعمال فرمت زمان به همراه sdate
  const timeAgo = formatRelativeTime(video.createdAtTimestamp, tr, video.sdate);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "group block w-full text-start transition-all duration-300",
        isActive && "opacity-80"
      )}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted transition-transform duration-300 group-hover:shadow-md">
        {showImage ? (
          <Image
            src={poster}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            onError={() => setHasError(true)}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <VideoOff className="text-muted-foreground size-8" />
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm fa-num">
          {formatDuration(video.duration)}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
          <Play className="size-12 scale-50 fill-white text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
        </div>
      </div>

      {/* Info Container */}
      <div className="pt-3 px-1">
        <h3 className="text-foreground line-clamp-2 h-12 text-base leading-normal font-semibold transition-colors duration-200 group-hover:text-primary">
          {video.title}
        </h3>
        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm font-medium fa-num">
          <span>{formatViews(video.visit_cnt)} {t("views")}</span>
          <span className="opacity-50">•</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </button>
  );
}
