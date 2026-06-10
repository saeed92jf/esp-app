// src/utils/aparatUtils.tsx

import { VideoItem, Category, VideoListItem } from "@/types";
import type { _Translator } from "next-intl";

// Group videos by the category name attached during fetch. Categories keep
// their original order; anything without a category falls into "Uncategorized".
export function groupVideosByCategory(
  videos: VideoListItem[],
): Record<string, VideoListItem[]> {
  const grouped: Record<string, VideoListItem[]> = {};

  for (const video of videos) {
    // categoryName is set client-side by useAparatChannel; no casts needed.
    const key =
      video.categoryName && video.categoryName.trim().length > 0
        ? video.categoryName
        : "Uncategorized";

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(video);
  }

  return grouped;
}

export function sortCategoryNames(categoryNames: string[]): string[] {
  return categoryNames.sort((a, b) => {
    if (a === "All Videos") return -1;
    if (b === "All Videos") return 1;
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatViews(views: number): string {
  if (!views || isNaN(views)) return "0";
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

/**
 * Ultra-light relative time formatter.
 * No parsing. Only math.
 */
export function formatRelativeTime(timestamp: number, t: _Translator): string {
  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);

  if (diffSeconds < 60) {
    return t("second", { value: diffSeconds });
  }

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) {
    return t("minute", { value: minutes });
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t("hour", { value: hours });
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return t("day", { value: days });
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return t("month", { value: months });
  }

  const years = Math.floor(days / 365);
  return t("year", { value: years });
}
