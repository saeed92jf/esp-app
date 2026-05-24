import {
  ChannelInfo,
  Category,
  VideoListItem,
  VideoInfo,
  UserProfile,
} from "@/types";

const BASE_URL = "https://www.aparat.com/etc/api";

export class AparatApiService {
  private static instance: AparatApiService;
  private constructor() {}

  public static getInstance(): AparatApiService {
    if (!AparatApiService.instance) {
      AparatApiService.instance = new AparatApiService();
    }
    return AparatApiService.instance;
  }

  private async fetchApi<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  async getChannelProfile(username: string): Promise<ChannelInfo> {
    const response = await this.fetchApi<{ profile: UserProfile }>(
      `/profile/username/${username}`
    );
    const profile = response.profile;
    
    // Convert profile to channel info format
    return {
      pic_s: profile.pic_s || "",
      pic_m: profile.pic_m || "",
      pic_b: profile.pic_b || "",
      username: profile.username,
      name: profile.name,
      video_cnt: 0, // Will be fetched separately
      url: `https://www.aparat.com/${profile.username}`,
      follower_cnt: 0, // Not available in public API
      followed_cnt: 0, // Not available in public API
      descr: "",
      official: "no",
      cover_src: "",
    };
  }

  async getUserVideos(username: string, perpage: number = 20): Promise<VideoListItem[]> {
    const response = await this.fetchApi<{ videobyuser: VideoListItem[] }>(
      `/videoByUser/username/${username}/perpage/${perpage}`
    );
    return response.videobyuser || [];
  }

  async getVideoInfo(videohash: string): Promise<VideoInfo | null> {
    try {
      const response = await this.fetchApi<{ video: VideoInfo }>(
        `/video/videohash/${videohash}`
      );
      return response.video || null;
    } catch {
      return null;
    }
  }

  async getUserCategories(username: string): Promise<Category[]> {
    try {
      const response = await this.fetchApi<{ profilecategories: Category[] }>(
        `/profilecategories/username/${username}`
      );
      return response.profilecategories || [];
    } catch {
      return [];
    }
  }

  async getVideosByCategory(
    username: string,
    usercat: number,
    perpage: number = 20
  ): Promise<VideoListItem[]> {
    try {
      const response = await this.fetchApi<{ videobyprofilecat: VideoListItem[] }>(
        `/videobyprofilecat/username/${username}/usercat/${usercat}/perpage/${perpage}`
      );
      return response.videobyprofilecat || [];
    } catch {
      return [];
    }
  }

  async searchVideos(query: string, perpage: number = 20): Promise<VideoListItem[]> {
    const encodedQuery = encodeURIComponent(query);
    const response = await this.fetchApi<{ videobysearch: VideoListItem[] }>(
      `/videoBySearch/text/${encodedQuery}/perpage/${perpage}`
    );
    return response.videobysearch || [];
  }
}

export const aparatApi = AparatApiService.getInstance();