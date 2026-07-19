// src/components/aparat/channel-header.tsx
"use client";

import * as React from "react";
import { Tv, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { Profile, VideoListItem } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SlidingTabs, type SlidingTabItem } from "./sliding-tabs";
import { ChannelVideoSearch } from "./channel-video-search";

interface ChannelHeaderProps {
  /** Active channel profile; null while it is still loading. */
  channel: Profile | null;
  /** Handle shown while `channel` is loading (the active tab value). */
  fallbackUsername: string;
  /** Videos of the active channel, fed into the embedded search box. */
  videos: VideoListItem[];
  /** Fired when a search result is chosen; forwarded to the search box. */
  onVideoSelect: (video: VideoListItem) => void;
  /** Tab definitions => labels/values fully controlled by the caller. */
  tabs: SlidingTabItem[];
  /**
   * Active tab value. Read-only here: it ONLY aligns the sliding pill in
   * <SlidingTabs>. Actual selection is driven by the parent <Tabs.Root> via
   * Radix context, so no change handler is needed.
   */
  tabValue: string;
  /** Extra classes for the outer header element. */
  className?: string;
}

/**
 * ChannelHeader
 * ----------------------------------------------------------------------------
 * Sticky, full-bleed channel header. It OWNS both controls in its right
 * column: the channel video search box (<ChannelVideoSearch>) and the tab rail
 * (<SlidingTabs>). The client only passes data; placement/behavior live here.
 *
 * Identity is read from the `channel: Profile` object (source of truth in
 * src/types/index.ts), with `fallbackUsername` covering the loading window.
 *
 * Sticky layout rules (kept intact from the working version):
 * - `sticky top-0` is the ONLY positioning. A second `position` value would
 *   cancel `sticky`.
 * - Full-bleed via width + negative margin only (no position change).
 * - A zero-height sentinel before the header is observed; when it leaves the
 *   viewport the header is "stuck" and a bottom shadow fades in.
 *
 * Note: `sticky` breaks if ANY ancestor has overflow hidden/auto/scroll.
 */
export function ChannelHeader({
  channel,
  fallbackUsername,
  videos,
  onVideoSelect,
  tabs,
  tabValue,
  className,
}: ChannelHeaderProps) {
  const t = useTranslations("Aparat");
  const locale = useLocale();

  // Resolved identity fields with safe fallbacks during the loading window.
  const name = channel?.name ?? fallbackUsername;
  const username = channel?.username ?? fallbackUsername;
  const avatarUrl = channel?.avatar;
  const followers = channel?.followers ?? 0;

  // Sentinel sits just above the header; when it scrolls out of view the
  // header has reached the top and we treat it as "stuck".
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const [stuck, setStuck] = React.useState(false);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      // rootMargin top -1px => fires the moment the sentinel crosses the edge.
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Locale-aware compact follower formatting (e.g. 12.3K). Wrapped so an
  // invalid locale tag can never crash the render.
  const followersLabel = React.useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, { notation: "compact" }).format(
        followers,
      );
    } catch {
      return new Intl.NumberFormat("en-US", { notation: "compact" }).format(
        followers,
      );
    }
  }, [locale, followers]);

  // Two-letter initials fallback when there is no avatar image.
  const initials = React.useMemo(
    () =>
      name
        .split(" ")
        .slice(0, 2)
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase(),
    [name],
  );

  return (
    <>
      {/* Sentinel: zero-height marker observed to detect the stuck state. */}
      <div ref={sentinelRef} aria-hidden className="h-0 w-full" />

      <header
        className={cn(
          // ONLY sticky here. No relative/absolute => sticky stays intact.
          "bg-background sticky top-0 z-30",
          // True full-bleed via width + negative margin (no position change).
          "ml-[calc(50%-50vw)] w-screen",
          // Allow the search dropdown to overflow the header.
          "overflow-visible border-b border-transparent",
          // Animate ONLY shadow for a smooth stuck transition.
          "transition-shadow duration-300 ease-out",
          stuck && "border-border/60 shadow-lg",
          className,
        )}
      >
        {/* Inner wrapper re-centers content to match the page grid. */}
        <div className="mx-auto grid w-full max-w-7xl min-w-sm grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[auto_1fr] md:items-center md:gap-6">
          {/* Column 1: identity (avatar + name + handle + followers). */}
          <div className="flex items-center gap-3">
            <Avatar className="size-14 shrink-0">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1.5">
                <Tv className="text-primary size-4 shrink-0" />
                <h1 className="text-foreground truncate text-lg font-semibold">
                  {name}
                </h1>
              </div>
              <span className="text-muted-foreground truncate text-sm">
                @{username}
              </span>
              <span className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                <Users className="size-3.5" />
                {followersLabel} {t("stats.followers")}
              </span>
            </div>
          </div>

          {/* Column 2: search box + tabs, both forced full-width and equal. */}
          <div className="relative flex flex-col gap-3 overflow-visible *:w-full">
            {/* Channel-scoped video search; results show thumbnail + info. */}
            <ChannelVideoSearch videos={videos} onSelect={onVideoSelect} />

            {/* Tabs; selection flows up via the parent <Tabs.Root> context. */}
            <SlidingTabs items={tabs} value={tabValue} />
          </div>
        </div>
      </header>
    </>
  );
}


