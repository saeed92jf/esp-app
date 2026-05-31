'use client';

import { useEffect, useRef, useState } from 'react';
import { VideoItem, Category } from '@/types';
import {
  formatEnglishDuration,
  formatEnglishViews,
  formatEnglishDate,
} from '@/utils/englishDate';
import { AutoText } from '@/components/custom/AutoText/AutoText';
import { detectLanguage } from '@/utils/languageDetector';

interface PlaylistProps {
  videos: VideoItem[];
  currentVideo: VideoItem | null;
  onVideoSelect: (video: VideoItem) => void;
  categories?: Category[];
  totalVideos?: number;
  isLoadingMore?: boolean;
  loadedCount?: number;
}

export function Playlist({
  videos,
  currentVideo,
  onVideoSelect,
  categories = [],
  totalVideos = 0,
  isLoadingMore = false,
}: PlaylistProps) {
  const playlistRef = useRef<HTMLDivElement>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // گروه‌بندی ویدیوها بر اساس دسته‌بندی
  const groupVideosByCategory = () => {
    const grouped: { [key: string]: VideoItem[] } = {};

    if (categories.length === 0) {
      return { 'All Videos': videos };
    }

    for (const category of categories) {
      grouped[category.cat_name] = [];
    }

    for (const video of videos) {
      const catName = (video as any).categoryName;
      if (catName && grouped[catName]) {
        grouped[catName].push(video);
      } else if (catName && catName !== 'All Videos') {
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(video);
      } else {
        if (!grouped['Uncategorized']) grouped['Uncategorized'] = [];
        grouped['Uncategorized'].push(video);
      }
    }

    Object.keys(grouped).forEach((key) => {
      if (grouped[key].length === 0) delete grouped[key];
    });

    if (Object.keys(grouped).length === 1 && grouped['Uncategorized']) {
      return { 'All Videos': grouped['Uncategorized'] };
    }

    return grouped;
  };

  const sortCategoryNames = (names: string[]): string[] => {
    return names.sort((a, b) => {
      if (a === 'All Videos') return -1;
      if (b === 'All Videos') return 1;
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return a.localeCompare(b);
    });
  };

  const groupedVideos = groupVideosByCategory();
  const categoryNames = sortCategoryNames(Object.keys(groupedVideos));

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) newSet.delete(categoryName);
      else newSet.add(categoryName);
      return newSet;
    });
  };

  useEffect(() => {
    if (categoryNames.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(categoryNames));
    }
  }, [categoryNames]);

  useEffect(() => {
    if (currentVideo && playlistRef.current) {
      const selectedElement = playlistRef.current.querySelector(
        `[data-id="${currentVideo.id}"]`,
      );
      if (selectedElement)
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
    }
  }, [currentVideo]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src =
      'https://via.placeholder.com/640x360?text=No+Thumbnail';
  };

  const uniqueVideos = Array.from(
    new Map(videos.map((v) => [v.id, v])).values(),
  );
  const percentage =
    totalVideos > 0 ? (uniqueVideos.length / totalVideos) * 100 : 100;
  const remainingVideos = totalVideos - uniqueVideos.length;

  const getCategoryFontClass = (categoryName: string) => {
    const lang = detectLanguage(categoryName);
    return lang === 'persian' ? 'font-persian' : 'font-english';
  };

  return (
    <div className="bg-surface-primary border-border-light duration-fast flex h-full flex-col rounded-xl border shadow-sm transition-all">
      {/* Header - English */}
      <div className="border-border-light shrink-0 border-b p-4">
        <div className="mb-1 flex items-center gap-2">
          <svg
            className="text-primary h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <h3 className="text-primary font-english text-base font-semibold">
            Playlist
          </h3>
        </div>
        <p className="text-tertiary font-english mt-1 text-sm">
          {uniqueVideos.length.toLocaleString('en')} of{' '}
          {totalVideos.toLocaleString('en')} videos
        </p>

        {isLoadingMore &&
          totalVideos > 0 &&
          uniqueVideos.length < totalVideos && (
            <div className="animate-fade-in mt-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-primary-600 dark:text-primary-400 font-english flex items-center gap-1 font-medium">
                  <svg
                    className="h-3 w-3 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Loading...
                </span>
                <span className="text-tertiary font-english">
                  {Math.round(percentage)}%
                </span>
              </div>
              <div className="bg-tertiary/30 h-2 w-full overflow-hidden rounded-full">
                <div
                  className="from-primary-500 to-info-500 h-full rounded-full bg-linear-to-r transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="border-primary-500 h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                <p className="text-tertiary font-english text-xs">
                  Loading {remainingVideos.toLocaleString('en')} more videos...
                </p>
              </div>
            </div>
          )}

        {!isLoadingMore &&
          totalVideos > 0 &&
          uniqueVideos.length === totalVideos && (
            <div className="animate-fade-in-up mt-2">
              <p className="text-success-600 dark:text-success-400 font-english flex items-center gap-1 text-xs">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                All {totalVideos.toLocaleString('en')} videos loaded
                successfully
              </p>
            </div>
          )}
      </div>

      {/* Video List */}
      <div ref={playlistRef} className="flex-1 overflow-y-auto">
        {categoryNames.map((categoryName) => {
          const categoryVideos = groupedVideos[categoryName];
          const isExpanded = expandedCategories.has(categoryName);
          const categoryCount = categoryVideos.length;
          const categoryFontClass = getCategoryFontClass(categoryName);

          if (categoryCount === 0) return null;

          return (
            <div
              key={categoryName}
              className="border-border-extra-light border-b last:border-0"
            >
              <div
                onClick={() => toggleCategory(categoryName)}
                className="bg-surface-secondary/90 hover:bg-surface-hover duration-fast sticky top-0 z-10 cursor-pointer px-4 py-2.5 backdrop-blur-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="text-tertiary h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span
                      className={`text-secondary text-sm font-semibold ${categoryFontClass}`}
                    >
                      {categoryName}
                    </span>
                    <span className="text-tertiary font-english text-xs">
                      ({categoryCount.toLocaleString('en')})
                    </span>
                  </div>
                  <svg
                    className={`text-tertiary h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {isExpanded && (
                <div className="divide-border-extra-light divide-y">
                  {categoryVideos.map((video, index) => {
                    const isSelected = currentVideo?.id === video.id;
                    const uniqueKey = `${video.id}-${video.uid || index}`;

                    return (
                      <div
                        key={uniqueKey}
                        data-id={video.id}
                        onClick={() => onVideoSelect(video)}
                        className={`group cursor-pointer p-3 transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary-light-10 border-primary-500 border-r-4'
                            : 'hover:bg-surface-hover'
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="relative w-28 shrink-0">
                            <img
                              src={
                                video.small_poster ||
                                video.big_poster ||
                                'https://via.placeholder.com/640x360?text=No+Thumbnail'
                              }
                              alt={video.title}
                              className="h-20 w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={handleImageError}
                              loading="lazy"
                            />
                            <div className="font-english absolute right-1 bottom-1 flex items-center gap-1 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-white backdrop-blur-sm">
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {formatEnglishDuration(video.duration)}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <AutoText
                              text={video.title}
                              as="h4"
                              className="text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-1 line-clamp-2 text-sm font-medium transition-colors"
                            />
                            {/* Stats - All English */}
                            <div className="mt-1 flex flex-col gap-1 text-xs">
                              {/* Date - English */}
                              <span className="font-english text-tertiary flex items-center gap-1">
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {formatEnglishDate(video.sdate)}
                              </span>
                              {/* Views - English */}
                              <span className="font-english text-tertiary flex items-center gap-1">
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                {formatEnglishViews(video.visit_cnt)} views
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {uniqueVideos.length === 0 && (
          <div className="text-tertiary font-english p-8 text-center">
            <svg
              className="text-tertiary/50 mx-auto mb-3 h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="font-medium">No videos available</p>
            <p className="mt-1 text-sm">Check back later for new content</p>
          </div>
        )}
      </div>
    </div>
  );
}
