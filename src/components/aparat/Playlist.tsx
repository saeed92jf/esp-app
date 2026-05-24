'use client';

import { useEffect, useRef, useState } from 'react';
import { VideoItem, Category } from '@/types';
import { formatEnglishDuration, formatEnglishViews, formatEnglishDate } from '@/utils/englishDate';
import { AutoText } from '@/components/ui/AutoText/AutoText';
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
  isLoadingMore = false
}: PlaylistProps) {
  const playlistRef = useRef<HTMLDivElement>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
    
    Object.keys(grouped).forEach(key => {
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
    setExpandedCategories(prev => {
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
      const selectedElement = playlistRef.current.querySelector(`[data-id="${currentVideo.id}"]`);
      if (selectedElement) selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentVideo]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/640x360?text=No+Thumbnail';
  };

  const uniqueVideos = Array.from(new Map(videos.map(v => [v.id, v])).values());
  const percentage = totalVideos > 0 ? (uniqueVideos.length / totalVideos) * 100 : 100;
  const remainingVideos = totalVideos - uniqueVideos.length;

  const getCategoryFontClass = (categoryName: string) => {
    const lang = detectLanguage(categoryName);
    return lang === 'persian' ? 'font-persian' : 'font-english';
  };

  return (
    <div className="bg-surface-primary rounded-xl shadow-sm border border-border-light flex flex-col h-full transition-all duration-fast">
      {/* Header - English */}
      <div className="p-4 border-b border-border-light shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <h3 className="font-semibold text-primary text-base font-english">Playlist</h3>
        </div>
        <p className="text-sm text-tertiary mt-1 font-english">
          {uniqueVideos.length.toLocaleString('en')} of {totalVideos.toLocaleString('en')} videos
        </p>
        
        {isLoadingMore && totalVideos > 0 && uniqueVideos.length < totalVideos && (
          <div className="mt-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 font-english">
                <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Loading...
              </span>
              <span className="text-tertiary font-english">{Math.round(percentage)}%</span>
            </div>
            <div className="w-full h-2 bg-tertiary/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-primary-500 to-info-500 rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }} 
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-tertiary font-english">
                Loading {remainingVideos.toLocaleString('en')} more videos...
              </p>
            </div>
          </div>
        )}
        
        {!isLoadingMore && totalVideos > 0 && uniqueVideos.length === totalVideos && (
          <div className="mt-2 animate-fade-in-up">
            <p className="text-xs text-success-600 dark:text-success-400 flex items-center gap-1 font-english">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              All {totalVideos.toLocaleString('en')} videos loaded successfully
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
            <div key={categoryName} className="border-b border-border-extra-light last:border-0">
              <div 
                onClick={() => toggleCategory(categoryName)}
                className="sticky top-0 z-10 bg-surface-secondary/90 backdrop-blur-sm px-4 py-2.5 cursor-pointer hover:bg-surface-hover transition-all duration-fast"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className={`text-sm font-semibold text-secondary ${categoryFontClass}`}>
                      {categoryName}
                    </span>
                    <span className="text-xs text-tertiary font-english">({categoryCount.toLocaleString('en')})</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-tertiary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {isExpanded && (
                <div className="divide-y divide-border-extra-light">
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
                            ? 'bg-primary-light-10 border-r-4 border-primary-500'
                            : 'hover:bg-surface-hover'
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="relative w-28 shrink-0">
                            <img
                              src={video.small_poster || video.big_poster || 'https://via.placeholder.com/640x360?text=No+Thumbnail'}
                              alt={video.title}
                              className="w-full h-20 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                              onError={handleImageError}
                              loading="lazy"
                            />
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded-md text-white text-xs font-medium flex items-center gap-1 font-english whitespace-nowrap">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatEnglishDuration(video.duration)}
                            </div>
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <AutoText 
                              text={video.title}
                              as="h4"
                              className="font-medium text-primary text-sm line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1"
                            />
                            {/* Stats - All English */}
                            <div className="flex flex-col gap-1 mt-1 text-xs">
                              {/* Date - English */}
                              <span className="flex items-center gap-1 font-english text-tertiary">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatEnglishDate(video.sdate)}
                              </span>
                              {/* Views - English */}
                              <span className="flex items-center gap-1 font-english text-tertiary">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
          <div className="p-8 text-center text-tertiary font-english">
            <svg className="w-16 h-16 mx-auto mb-3 text-tertiary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="font-medium">No videos available</p>
            <p className="text-sm mt-1">Check back later for new content</p>
          </div>
        )}
      </div>
    </div>
  );
}