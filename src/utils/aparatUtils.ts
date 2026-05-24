// src/utils/aparatUtils.tsx

import { VideoItem, Category } from '@/types';

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatViews(views: number): string {
  if (!views || isNaN(views)) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  
  try {
    const persianPattern = /^(13|14)\d{2}[/\-]\d{1,2}[/\-]\d{1,2}/;
    if (persianPattern.test(dateStr)) {
      return dateStr.replace(/-/g, '/');
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function groupVideosByCategory(videos: VideoItem[], categories: Category[]): { [key: string]: VideoItem[] } {
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
}

export function sortCategoryNames(categoryNames: string[]): string[] {
  return categoryNames.sort((a, b) => {
    if (a === 'All Videos') return -1;
    if (b === 'All Videos') return 1;
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });
}