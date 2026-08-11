"use client";

import React, { useState } from "react";
import type { VideoListItem } from "../types";
import { GenericSearchBox } from "@/components/ui/generic-search-box";
import { VideoSearchResult } from "./video-search-result";
import { normalizeSearchText } from "@/lib/navigation-search";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface ChannelVideoSearchProps {
  videos: VideoListItem[];
  onSelect: (video: VideoListItem) => void;
  className?: string;
}

export function ChannelVideoSearch({
  videos,
  onSelect,
  className,
}: ChannelVideoSearchProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [query, setQuery] = useState("");

  const filterFn = (q: string, items: VideoListItem[]) => {
    const normalizedQuery = normalizeSearchText(q);
    if (!normalizedQuery) return [];
    
    return items.filter((video) => {
      if (normalizeSearchText(video.title).includes(normalizedQuery)) return true;
      if (normalizeSearchText(video.username).includes(normalizedQuery)) return true;
      return false;
    }).slice(0, 10); // Limit to 10 results
  };

  const renderItem = (video: VideoListItem, isSelected: boolean, handleSelect: () => void) => {
    return (
      <div
        key={video.id}
        onClick={handleSelect}
        className={cn(
          "group/result relative me-2.5 flex cursor-pointer select-none items-center justify-between p-2 px-3.5 transition-colors",
          "rounded-s-none rounded-e-full",
          isSelected
            ? "bg-[#e8eaed] dark:bg-[#303134]"
            : "hover:bg-[#e8eaed]/80 dark:hover:bg-[#303134]/80",
        )}
      >
        {isSelected && (
          <span className="absolute inset-y-0 start-0 w-[4px] bg-[#1a73e8]" />
        )}
        <div className="flex w-full min-w-0 items-center gap-3">
          <VideoSearchResult video={video} query={query} />
        </div>
      </div>
    );
  };

  return (
    <GenericSearchBox
      className={className}
      historyKey="aparat-search-history"
      items={videos}
      filterFn={filterFn}
      renderItem={renderItem}
      getItemKey={(v) => v.id}
      onSelect={onSelect}
      onQueryChange={setQuery}
      placeholder={
        isRtl
          ? "جستجوی ویدیو..."
          : "Search videos..."
      }
    />
  );
}
