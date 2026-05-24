import { useState, useEffect, useCallback } from "react";
import { aparatApi } from "@/services/aparatApi";
import { ChannelInfo, VideoListItem, Category } from "@/types";

interface UseChannelDataReturn {
  channel: ChannelInfo | null;
  videos: VideoListItem[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchVideosByCategory: (categoryId: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useChannelData(username: string): UseChannelDataReturn {
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannelInfo = useCallback(async () => {
    try {
      const channelData = await aparatApi.getChannelProfile(username);
      setChannel(channelData);
    } catch (err) {
      setError("Failed to fetch channel info");
      console.error(err);
    }
  }, [username]);

  const fetchAllVideos = useCallback(async () => {
    try {
      const videoList = await aparatApi.getUserVideos(username, 50);
      setVideos(videoList);
    } catch (err) {
      setError("Failed to fetch videos");
      console.error(err);
    }
  }, [username]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoryList = await aparatApi.getUserCategories(username);
      setCategories(categoryList);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, [username]);

  const fetchVideosByCategory = useCallback(
    async (categoryId: number) => {
      setLoading(true);
      try {
        const categoryVideos = await aparatApi.getVideosByCategory(
          username,
          categoryId,
          50
        );
        setVideos(categoryVideos);
      } catch (err) {
        setError("Failed to fetch category videos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [username]
  );

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchChannelInfo(), fetchAllVideos(), fetchCategories()]);
    setLoading(false);
  }, [fetchChannelInfo, fetchAllVideos, fetchCategories]);

  useEffect(() => {
    if (username) {
      refreshData();
    }
  }, [username]);

  return {
    channel,
    videos,
    categories,
    loading,
    error,
    fetchVideosByCategory,
    refreshData,
  };
}