"use client";

import * as React from "react";
import type { VideoListItem } from "../types";
import { cn } from "@/lib/utils";
import { SlidingTabs, type SlidingTabItem } from "./sliding-tabs";
import { ChannelVideoSearch } from "./channel-video-search";

interface ChannelHeaderProps {
  videos: VideoListItem[];
  onVideoSelect: (video: VideoListItem) => void;
  tabs: SlidingTabItem[];
  tabValue: string;
  className?: string;
}

export function ChannelHeader({
  videos,
  onVideoSelect,
  tabs,
  tabValue,
  className,
}: ChannelHeaderProps) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const [stuck, setStuck] = React.useState(false);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="w-full">
      <div ref={sentinelRef} aria-hidden className="h-0 w-full" />

      <header
        className={cn(
          "bg-background sticky top-0 z-30",
          "w-full",
          "overflow-visible border-b border-transparent",
          "transition-shadow duration-300 ease-out",
          className,
        )}
      >
        <div className="mx-auto w-full max-w-7xl min-w-sm px-4 py-3 md:py-4">
          <div className="relative flex flex-col gap-3 overflow-visible md:flex-row md:items-center md:justify-between md:gap-6">
            
            {/* Tabs taking available space or structured? */}
            <div className="flex-1 w-full overflow-x-auto custom-scrollbar md:w-auto">
              <SlidingTabs items={tabs} value={tabValue} />
            </div>

            <div className="w-full md:w-96 shrink-0 relative overflow-visible z-50 flex flex-col gap-1">
              <ChannelVideoSearch videos={videos} onSelect={onVideoSelect} />
            </div>

          </div>
        </div>
      </header>
    </div>
  );
}
