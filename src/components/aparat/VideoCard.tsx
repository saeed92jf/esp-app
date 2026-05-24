'use client';

import { VideoItem } from '@/types';
import { formatDuration, formatViews, formatDate } from '@/utils/aparatUtils';

interface VideoCardProps {
  video: VideoItem;
  isActive?: boolean;
  onClick: () => void;
}

export function VideoCard({ video, isActive, onClick }: VideoCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/640x360?text=No+Thumbnail';
  };

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
        isActive
          ? 'ring-2 ring-primary-500 shadow-lg scale-[1.02]'
          : 'hover:shadow-lg hover:scale-[1.02] hover:ring-1 hover:ring-primary-300'
      } bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.small_poster || video.big_poster || 'https://via.placeholder.com/640x360?text=No+Thumbnail'}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={handleImageError}
        />
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded-md text-white text-xs font-medium shadow-sm">
          {formatDuration(video.duration)}
        </div>
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="text-white text-5xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
            ▶️
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-primary text-sm line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-tertiary">
          <span className="flex items-center gap-1">👁️ {formatViews(video.visit_cnt)}</span>
          <span>•</span>
          <span>{formatDate(video.sdate)}</span>
        </div>
      </div>
    </div>
  );
}