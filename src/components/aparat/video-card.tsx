// src/components/aparat/video-card.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Eye, Play, VideoOff } from 'lucide-react';
import type { VideoItem } from '@/types';
import { cn } from '@/lib/utils';
import { formatDuration, formatViews, formatDate } from '@/utils/aparatUtils';

interface VideoCardProps {
  video: VideoItem;
  isActive?: boolean;
  onClick: () => void;
}

export function VideoCard({ video, isActive, onClick }: VideoCardProps) {
  // Track image failure locally instead of swapping to an external
  // placeholder service; fall back to an in-app icon state.
  const [hasError, setHasError] = useState(false);
  const poster = video.small_poster || video.big_poster;
  const showImage = poster && !hasError;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'group bg-card block w-full overflow-hidden rounded-lg border text-start transition-all duration-300',
        isActive
          ? 'ring-primary scale-[1.02] shadow-lg ring-2'
          : 'hover:ring-primary/50 hover:scale-[1.02] hover:shadow-lg hover:ring-1',
      )}
    >
      <div className="bg-muted relative aspect-video overflow-hidden">
        {showImage ? (
          <Image
            src={poster}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            loading="lazy"
            onError={() => setHasError(true)}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // In-app fallback when no poster is available or the image fails.
          <div className="flex h-full w-full items-center justify-center">
            <VideoOff className="text-muted-foreground size-8" />
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute inset-e-2 bottom-2 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
          {formatDuration(video.duration)}
        </div>

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
          <Play className="size-12 scale-50 fill-white text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
        </div>
      </div>

      <div className="p-3">
        {/* Reserve a fixed two-line height for the title so single-line and
            two-line titles occupy the same space and never shift the grid.
            text-sm (0.875rem) with leading-5 (1.25rem) => 2 lines = 2.5rem. */}
        <h3 className="text-foreground group-hover:text-primary line-clamp-2 h-[2.5rem] text-sm leading-5 font-medium transition-colors duration-200">
          {video.title}
        </h3>
        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {formatViews(video.visit_cnt)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {formatDate(video.sdate)}
          </span>
        </div>
      </div>
    </button>
  );
}
