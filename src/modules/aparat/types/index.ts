export interface Profile {
  name: string; // اجباری شد تا با تایپ سراسری شما همخوانی داشته باشد
  username: string;
  avatar?: string;
  followers?: number;
}

export interface VideoListItem {
  id: string | number;
  uid: string;
  title: string;
  username: string;
  small_poster?: string;
  big_poster?: string;
  duration: number;
  visit_cnt: number;
  createdAtTimestamp: number;
  titleDir?: "rtl" | "ltr" | "auto";
  // فیلدهای اضافه برای تطابق کامل با دیتای آپارات
  userid?: string | number;
  process?: string;
  sdate?: string;
  frame?: string;
  official?: boolean | string;
  [key: string]: any;
}

export interface VideoItem extends VideoListItem {}

export interface ChannelStatsProps {
  videoCount: number;
  followerCount: number;
  followedCount: number;
  official?: boolean;
}

export interface PlaylistProps {
  videos: VideoListItem[];
  currentVideoId?: string | number;
  onVideoSelect: (video: VideoListItem) => void;
}
