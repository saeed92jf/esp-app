'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoPlayer } from '@/components/aparat/VideoPlayer';
import { Playlist } from '@/components/aparat/Playlist';
import { SearchPopup } from '@/components/aparat/SearchPopup';
import { VideoCard } from '@/components/aparat/VideoCard';
import { VideoItem, Category } from '@/types';

// ============================================
// Channel Settings
// ============================================
const CHANNEL_USERNAME = 'zoomit';
const ITEMS_PER_PAGE = 5000;
const MIN_VIDEOS_TO_SHOW = 50;
// ============================================

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [showContent, setShowContent] = useState(false);
  const [totalVideos, setTotalVideos] = useState(0);
  const [allVideosLoaded, setAllVideosLoaded] = useState(false);
  const [randomVideos, setRandomVideos] = useState<VideoItem[]>([]);
  const loadingRef = useRef(false);

  const fetchFromApi = async (endpoint: string, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(`/api/aparat/${endpoint}`);
        if (!response.ok) {
          if (response.status === 500 && i < retries) {
            console.log(`Retrying... (${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        if (i === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return {};
  };

  // Fetch channel info
  const fetchChannelInfo = async () => {
    try {
      const data = await fetchFromApi(`profile/username/${CHANNEL_USERNAME}`);
      if (data.profile) {
        setChannel(data.profile);
        setTotalVideos(data.profile.video_cnt || 0);
        console.log(`📊 Total videos: ${data.profile.video_cnt || 0}`);
      }
    } catch (err) {
      console.error('Error fetching channel:', err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await fetchFromApi(`profilecategories/username/${CHANNEL_USERNAME}`);
      if (data.profilecategories && Array.isArray(data.profilecategories) && data.profilecategories.length > 0) {
        setCategories(data.profilecategories);
        console.log(`📁 Categories: ${data.profilecategories.length}`);
      }
    } catch (err) {
      console.log('No categories available');
      setCategories([]);
    }
  };

  // Load all videos
  const loadAllVideos = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    const allVideosMap = new Map<number, VideoItem>();
    let page = 1;
    let hasMore = true;
    
    console.log(`🚀 Loading videos for ${CHANNEL_USERNAME}...`);
    
    while (hasMore) {
      try {
        const data = await fetchFromApi(`videoByUser/username/${CHANNEL_USERNAME}/perpage/${ITEMS_PER_PAGE}/page/${page}`);
        const newVideos: VideoItem[] = data.videobyuser || [];
        
        if (newVideos.length === 0) {
          hasMore = false;
        } else {
          for (const video of newVideos) {
            if (!allVideosMap.has(video.id)) {
              allVideosMap.set(video.id, video);
            }
          }
          
          const currentVideos = Array.from(allVideosMap.values());
          setVideos(currentVideos);
          setLoadingProgress({ current: currentVideos.length, total: totalVideos || currentVideos.length });
          
          if (!showContent && currentVideos.length >= MIN_VIDEOS_TO_SHOW) {
            setShowContent(true);
            setLoading(false);
            if (currentVideos.length > 0 && !selectedVideo) {
              setSelectedVideo(currentVideos[0]);
              // Set random videos
              const shuffled = [...currentVideos].sort(() => 0.5 - Math.random());
              setRandomVideos(shuffled.slice(0, 8));
            }
          }
          
          page++;
          
          if (newVideos.length < ITEMS_PER_PAGE) {
            hasMore = false;
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (err) {
        console.error(`Error loading page ${page}:`, err);
        hasMore = false;
      }
    }
    
    const finalVideos = Array.from(allVideosMap.values());
    console.log(`✅ Loaded ${finalVideos.length} videos`);
    
    setVideos(finalVideos);
    setTotalVideos(finalVideos.length);
    setAllVideosLoaded(true);
    loadingRef.current = false;
    
    if (!showContent) {
      setShowContent(true);
      setLoading(false);
      if (finalVideos.length > 0 && !selectedVideo) {
        setSelectedVideo(finalVideos[0]);
        const shuffled = [...finalVideos].sort(() => 0.5 - Math.random());
        setRandomVideos(shuffled.slice(0, 8));
      }
    }
  }, [totalVideos, showContent, selectedVideo]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchChannelInfo();
      await fetchCategories();
      await loadAllVideos();
    };
    init();
  }, []);

  const isStillLoading = !allVideosLoaded && videos.length < totalVideos && totalVideos > 0;

  if (!showContent) {
    const percentage = totalVideos > 0 ? (loadingProgress.current / totalVideos) * 100 : 0;
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">Loading {CHANNEL_USERNAME} channel...</p>
          {loadingProgress.current > 0 && (
            <div className="mt-4">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Loaded {loadingProgress.current.toLocaleString('en')} of {totalVideos.toLocaleString('en')} videos
              </p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">Page will appear after loading {MIN_VIDEOS_TO_SHOW} videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with channel info */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            {/* Channel Info - Left */}
            {channel && (
              <div className="flex items-center gap-3">
                <img
                  src={channel.pic_m || channel.pic_s}
                  alt={channel.name}
                  className="w-10 h-10 rounded-full ring-2 ring-blue-500/20"
                />
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{channel.name}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@{channel.username}</p>
                </div>
              </div>
            )}
            
            {/* Empty div for spacing */}
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Search Bar - Below channel name, above player and playlist */}
      <div className="sticky top-[73px] z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <SearchPopup
                onVideoSelect={setSelectedVideo}
                videos={videos}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Player and Playlist - Same height (half screen) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player - Same height as playlist */}
          <div className="lg:col-span-2" style={{ height: 'calc(50vh - 100px)' }}>
            <VideoPlayer video={selectedVideo} />
          </div>
          
          {/* Playlist - Fixed height (half screen) */}
          <div className="lg:col-span-1" style={{ height: 'calc(50vh - 100px)' }}>
            <Playlist
              videos={videos}
              currentVideo={selectedVideo}
              onVideoSelect={setSelectedVideo}
              categories={categories}
              totalVideos={totalVideos || videos.length}
              isLoadingMore={isStillLoading}
              loadedCount={videos.length}
            />
          </div>
        </div>

        {/* Random Videos Section */}
        {randomVideos.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">You might also like</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {randomVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isActive={selectedVideo?.id === video.id}
                  onClick={() => setSelectedVideo(video)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}