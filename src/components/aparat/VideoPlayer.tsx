'use client';

import { useState } from 'react';
import { VideoItem } from '@/types';
import { formatEnglishViews, formatEnglishDate, formatEnglishDuration } from '@/utils/englishDate';
import { AutoText } from '@/components/ui/AutoText/AutoText';

interface VideoPlayerProps {
  video: VideoItem | null;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const [iframeError, setIframeError] = useState(false);

  if (!video) {
    return (
      <div className="bg-surface-secondary rounded-xl flex items-center justify-center h-full min-h-100">
        <div className="text-center text-tertiary font-english">
          <svg className="w-16 h-16 mx-auto mb-3 text-tertiary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="font-medium">Select a video to watch</p>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.aparat.com/video/video/embed/videohash/${video.uid}/vt/frame`;

  return (
    <div className="space-y-4">
      {/* Video Frame */}
      <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
        <div className="relative aspect-video">
          {iframeError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-gray-400 font-english">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm font-medium">Unable to load video</p>
                <a 
                  href={`https://www.aparat.com/v/${video.uid}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-3 inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm underline transition-colors"
                >
                  Watch on Aparat
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={video.title}
              onError={() => setIframeError(true)}
            />
          )}
        </div>
      </div>
      
      {/* Video Info - All English except title */}
      <div className="bg-surface-primary rounded-xl p-5 shadow-sm border border-border-light">
        {/* Title - Auto detect Persian/English */}
        <AutoText 
          text={video.title}
          as="h2"
          className="text-xl font-bold text-primary mb-3 line-clamp-2"
        />
        
        {/* Stats - All English */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-tertiary pb-3 border-b border-border-light font-english">
          {/* Views */}
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {formatEnglishViews(video.visit_cnt)} views
          </span>
          
          {/* Date */}
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatEnglishDate(video.sdate)}
          </span>
          
          {/* Channel */}
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            @{video.username}
          </span>
          
          {/* Duration */}
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatEnglishDuration(video.duration)}
          </span>
        </div>
        
        {/* Description - English */}
        {video.description && (
          <div className="mt-4">
            <p className="text-secondary text-sm leading-relaxed font-english">
              {video.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}