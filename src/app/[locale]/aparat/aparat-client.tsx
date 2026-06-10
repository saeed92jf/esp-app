"use client";

import { useMemo, useState, useEffect } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { useAparatChannel } from "@/hooks/use-aparat-channel";
import { ChannelHeader } from "@/components/aparat/channel-header";
import { VideoPlayer } from "@/components/aparat/video-player";
import { Playlist } from "@/components/aparat/playlist";
import { VideoCard } from "@/components/aparat/video-card";
import { AparatSkeleton } from "@/components/aparat/aparat-skeleton";
import type { SlidingTabItem } from "@/components/aparat/sliding-tabs";

interface AparatClientProps {
  /** List of Aparat channel usernames */
  usernames: string[];
}

/* ----------------------------- Skeleton Components ----------------------------- */

/**
 * Skeleton for channel header while channel data is loading
 */
function ChannelHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <AparatSkeleton className="h-16 w-16 rounded-full" />

      <div className="flex flex-1 flex-col gap-2">
        <AparatSkeleton className="h-4 w-40" />
        <AparatSkeleton className="h-3 w-60" />
      </div>
    </div>
  );
}

/**
 * Skeleton for video player section
 */
function VideoPlayerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
        <AparatSkeleton className="h-full w-full" />
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
        <AparatSkeleton className="h-4 w-2/3" />
        <AparatSkeleton className="h-3 w-1/2" />
        <AparatSkeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton for random video cards
 */
function RandomVideosSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-video overflow-hidden rounded-md bg-muted">
            <AparatSkeleton className="h-full w-full" />
          </div>

          <AparatSkeleton className="h-3 w-3/4" />
          <AparatSkeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for playlist while videos are loading
 */
function PlaylistSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted">
              <AparatSkeleton className="h-full w-full" />
            </div>

            <div className="flex-1 space-y-2 py-1">
              <AparatSkeleton className="h-3 w-full" />
              <AparatSkeleton className="h-3 w-3/4" />
              <AparatSkeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------- */

export function AparatClient({ usernames }: AparatClientProps) {
  const [activeUsername, setActiveUsername] = useState<string>(
    usernames[0] ?? "",
  );

  const { channel, videos, selectedVideo, randomVideos, selectVideo } =
    useAparatChannel(activeUsername);

  /**
   * Convert usernames to tab items
   */
  const tabItems = useMemo<SlidingTabItem[]>(
    () => usernames.map((name) => ({ value: name, label: name })),
    [usernames],
  );

  /**
   * Page becomes ready when we have channel data and at least one video
   */
  const isReady = !!channel && videos.length > 0;

  /**
   * Automatically select the first video when videos load
   */
  useEffect(() => {
    if (isReady && !selectedVideo) {
      selectVideo(videos[0]);
    }
  }, [isReady, videos, selectedVideo, selectVideo]);

  return (
    <TabsPrimitive.Root
      value={activeUsername}
      onValueChange={setActiveUsername}
      className="flex w-full min-w-0 flex-col gap-6"
    >
      {/* ---------------- Header ---------------- */}
      {!channel ? (
        <ChannelHeaderSkeleton />
      ) : (
        <ChannelHeader
          channel={channel}
          fallbackUsername={activeUsername}
          videos={videos}
          onVideoSelect={selectVideo}
          tabs={tabItems}
          tabValue={activeUsername}
        />
      )}

      {/* ---------------- Layout ---------------- */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[2fr_1fr]">
        {/* LEFT SIDE */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Video Player */}
          {!isReady ? (
            <VideoPlayerSkeleton />
          ) : (
            <VideoPlayer video={selectedVideo} />
          )}

          {/* Random Videos */}
          {!isReady ? (
            <RandomVideosSkeleton />
          ) : randomVideos.length > 0 ? (
            <section className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {randomVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    isActive={selectedVideo?.id === video.id}
                    onClick={() => selectVideo(video)}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* RIGHT SIDE PLAYLIST */}
        <div className="min-w-0">
          {!isReady ? (
            <PlaylistSkeleton />
          ) : (
            <Playlist
              videos={videos}
              currentVideoId={selectedVideo?.id ?? null}
              onVideoSelect={selectVideo}
            />
          )}
        </div>
      </div>
    </TabsPrimitive.Root>
  );
}
