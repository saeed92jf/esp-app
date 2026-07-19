// src/components/aparat/video-search-result.tsx
import { Calendar, Clock, Eye, VideoOff } from "lucide-react";
import type { VideoListItem } from "../types";
import {
  formatRelativeTime,
  formatDuration,
  formatViews,
} from "../utils/formatters";
import { useTranslations } from "next-intl";

function highlightText(text: string, query: string) {
  if (!query || query.length < 2 || !text) return text;
  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const lowerQuery = query.toLowerCase();
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === lowerQuery ? (
        <mark key={index} className="bg-primary/20 text-foreground rounded">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
  } catch {
    return text;
  }
}

interface VideoSearchResultProps {
  video: VideoListItem;
  query: string;
}

export function VideoSearchResult({ video, query }: VideoSearchResultProps) {
  // Move useTranslations inside the component
  const tr = useTranslations("Aparat.time");
  const poster = video.small_poster || video.big_poster;
  const timeAgo = formatRelativeTime(video.createdAtTimestamp, tr, video.sdate);

  return (
    <>
      <div className="relative w-16 shrink-0">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={video.title}
            loading="lazy"
            className="h-12 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="bg-muted flex h-12 w-full items-center justify-center rounded-lg">
            <VideoOff className="text-muted-foreground size-4" />
          </div>
        )}
        <div className="absolute inset-e-0 bottom-0 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white">
          <Clock className="size-2" />
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div
          dir={video.titleDir}
          className="text-foreground line-clamp-2 text-sm font-medium"
        >
          {highlightText(video.title, query)}
        </div>
        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
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
    </>
  );
}


