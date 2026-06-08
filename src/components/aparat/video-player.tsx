// src/components/aparat/video-player.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  User,
  Video as VideoIcon,
} from 'lucide-react';

import type { VideoItem } from '@/types';
import { formatDuration, formatViews, formatDate } from '@/utils/aparatUtils';

interface VideoPlayerProps {
  video: VideoItem | null;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const t = useTranslations('Aparat');
  const [iframeError, setIframeError] = useState(false);

  // Empty state: no video selected yet.
  if (!video) {
    return (
      <div className="bg-muted flex h-full min-h-100 items-center justify-center rounded-xl">
        <div className="text-muted-foreground text-center">
          <VideoIcon className="mx-auto mb-3 size-16 opacity-50" />
          <p className="font-medium">{t('selectVideoToWatch')}</p>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.aparat.com/video/video/embed/videohash/${video.uid}/vt/frame`;

  return (
    <div className="space-y-4">
      {/* Video frame */}
      <div className="overflow-hidden rounded-2xl bg-black shadow-xl">
        <div className="relative aspect-video">
          {iframeError ? (
            // Fallback when the embed fails to load: offer an external link.
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <div className="text-center text-zinc-400">
                <AlertTriangle className="mx-auto mb-3 size-12" />
                <p className="text-sm font-medium">{t('unableToLoadVideo')}</p>
                <a
                  href={`https://www.aparat.com/v/${video.uid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 mt-3 inline-flex items-center gap-2 text-sm underline transition-colors"
                >
                  {t('watchOnAparat')}
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              className="absolute inset-0 size-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={video.title}
              onError={() => setIframeError(true)}
            />
          )}
        </div>
      </div>

      {/* Video info */}
      <div className="bg-card rounded-xl border p-5 shadow-sm">
        {/* Title — direction is precomputed in the API normalization layer. */}
        <h2
          dir={video.titleDir}
          className="text-foreground mb-3 line-clamp-2 text-xl font-bold"
        >
          {video.title}
        </h2>

        {/* Stats row */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-4 border-b pb-3 text-sm">
          <span className="flex items-center gap-1.5">
            <Eye className="size-4" />
            {formatViews(video.visit_cnt)} {t('views')}
          </span>

          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {formatDate(video.sdate)}
          </span>

          <span className="flex items-center gap-1.5">
            <User className="size-4" />@{video.username}
          </span>

          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {formatDuration(video.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
