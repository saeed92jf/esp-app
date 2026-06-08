/* src/types/index.ts */
import { TextDirection } from '@/utils/textDirection';
import { ReactNode } from 'react';

/* ============================================================
 * Category
 * Single source of truth, aligned with the real Aparat API.
 * `title` kept optional as a UI-friendly alias used by some components.
 * ============================================================ */
export interface Category {
  cat_id: number; // numeric category id from Aparat
  cat_name: string; // category display name
  cat_cnt: number; // number of videos in this category
  link: string; // canonical Aparat link for the category
  title?: string; // optional alias of cat_name for UI components
}

export interface CategoryWithVideos extends Category {
  data: VideoListItem[]; // videos belonging to this category
}

/* ============================================================
 * Video list item
 * Lightweight shape used by the Playlist and video lists.
 * Field names match the real Aparat API output.
 * ============================================================ */
export interface VideoListItem {
  id: number; // numeric video id
  uid: string; // public string id used in URLs/embeds
  title: string;
  username: string; // owner channel username
  userid: number; // owner channel id
  visit_cnt: number; // numeric view count
  process: string; // processing state of the video
  small_poster: string; // small thumbnail url
  big_poster: string; // large thumbnail url
  duration: number; // duration in seconds
  sdate: string; // human-readable date string from Aparat
  frame: string; // embed/frame url
  official: string; // "yes" | "no" flag from Aparat
  autoplay: boolean;
  '360d': boolean; // 360-degree video flag
  categoryId?: number; // resolved category id, when available
  categoryName?: string; // resolved category title, or "Uncategorized"
  titleDir: TextDirection; // precomputed in the API normalization layer
}

/* ============================================================
 * Video item (player)
 * Extends the list shape with player-only fields.
 * `frame` is inherited from VideoListItem, so it is NOT redeclared
 * here to avoid an optional/required mismatch on extension.
 * ============================================================ */
export interface VideoItem extends VideoListItem {
  description?: string;
  file_link?: string; // direct file link, when available
}

/* ============================================================
 * Full video info (detailed payload)
 * ============================================================ */
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
  '360d': boolean;
  has_comment: string;
  has_comment_txt?: string;
  size?: number;
  can_download: boolean;
  like_cnt: number;
}

/* ============================================================
 * Profiles
 * ============================================================ */
export interface Profile {
  username: string;
  name: string;
  avatar: string;
  followers?: number;
}

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  pic: string;
  pic_s: string;
  pic_m: string;
  pic_b: string;
  banned: 'yes' | 'no';
  email?: string;
  mobile_number?: string;
  mobile_valid?: string;
  ltoken?: string;
}

export interface ChannelProfile {
  id: number;
  name: string;
  username: string;
  pic_s?: string;
  pic_m?: string;
  video_cnt?: number;
}

/* ============================================================
 * Channel info
 * ============================================================ */
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
  avatar: string;
  followers: number;
}

/* ============================================================
 * API response wrappers
 * ============================================================ */
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

/* ============================================================
 * Component props
 * ============================================================ */
export interface ChannelHeaderProps {
  channel: Profile | null;
  children?: ReactNode;
  className?: string;
}

export interface VideoPlayerProps {
  video: VideoInfo | null;
}

export interface PlaylistProps {
  videos: VideoListItem[];
  currentVideoId: number | null;
  onVideoSelect: (video: VideoListItem) => void;
  categories?: Category[];
  totalVideos?: number;
  isLoadingMore?: boolean;
  loadedCount?: number;
  title?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
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

/* ============================================================
 * Misc
 * ============================================================ */
export interface LiveStream {
  id: string;
  title: string;
  username: string;
  viewer_count: number;
  status: string;
}

export interface SearchSuggestion {
  text: string;
  count: number;
  type: 'suggestion' | 'history';
}
