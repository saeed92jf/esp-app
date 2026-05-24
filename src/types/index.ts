// Channel/User Profile Types
export interface UserProfile {
  id: number;
  username: string;
  name: string;
  pic: string;
  pic_s: string;
  pic_m: string;
  pic_b: string;
  banned: "yes" | "no";
  email?: string;
  mobile_number?: string;
  mobile_valid?: string;
  ltoken?: string;
}

// Channel Info Types
export interface ChannelInfo {
  pic_s: string;
  pic_m: string;
  pic_b: string;
  username: string;
  name: string;
  video_cnt: number;
  url: string;
  follower_cnt: number;
  followed_cnt: number;
  descr: string;
  official: string;
  cover_src: string;
}

// Category Types
export interface Category {
  cat_id: number;
  cat_name: string;
  cat_cnt: number;
  link: string;
}

export interface CategoryWithVideos extends Category {
  data: VideoListItem[];
}

// Video Types
export interface VideoInfo {
  id: number;
  title: string;
  username: string;
  userid: number;
  visit_cnt: number;
  uid: string;
  process: string;
  sender_name: string;
  big_poster: string;
  small_poster: string;
  profilePhoto: string;
  duration: number;
  sdate: string;
  frame: string;
  official: string;
  tags: string[];
  description: string;
  cat_id: number;
  cat_name: string;
  autoplay: boolean;
  "360d": boolean;
  has_comment: string;
  has_comment_txt?: string;
  size?: number;
  can_download: boolean;
  like_cnt: number;
}

export interface VideoListItem {
  id: number;
  title: string;
  username: string;
  userid: number;
  visit_cnt: number;
  uid: string;
  process: string;
  big_poster: string;
  small_poster: string;
  duration: number;
  sdate: string;
  frame: string;
  official: string;
  autoplay: boolean;
  "360d": boolean;
}

// API Response Types
export interface ProfileResponse {
  profile: UserProfile;
}

export interface ChannelResponse {
  channel: ChannelInfo;
}

export interface ProfileCategoriesResponse {
  profilecategories: Category[];
}

export interface VideoByUserResponse {
  videobyuser: VideoListItem[];
}

export interface VideoResponse {
  video: VideoInfo;
}

export interface VideoByProfileCatResponse {
  videobyprofilecat: VideoListItem[];
}

// Component Props Types
export interface ChannelHeaderProps {
  channel: ChannelInfo;
}

export interface VideoPlayerProps {
  video: VideoInfo | null;
  onVideoSelect?: (video: VideoListItem) => void;
}

export interface PlaylistProps {
  videos: VideoListItem[];
  currentVideoId: number | null;
  onVideoSelect: (video: VideoListItem) => void;
  title?: string;
}

export interface ChannelStatsProps {
  videoCount: number;
  followerCount: number;
  followedCount: number;
  official: string;
}

export interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

export interface VideoCardProps {
  video: VideoListItem;
  isActive: boolean;
  onClick: () => void;
}

// Live Stream Types
export interface LiveStream {
  id: string;
  title: string;
  username: string;
  viewer_count: number;
  status: string;
}

export interface VideoItem {
  id: number;
  title: string;
  username: string;
  userid: number;
  visit_cnt: number;
  uid: string;
  big_poster: string;
  small_poster: string;
  duration: number;
  sdate: string;
  description?: string;
}

export interface SearchSuggestion {
  text: string;
  count: number;
  type: 'suggestion' | 'history';
}

// اضافه کن به فایل types
export interface Category {
  cat_id: number;
  cat_name: string;
  cat_cnt: number;
  link: string;
}