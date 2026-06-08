// src/components/aparat/aparat-client.tsx
'use client';

// ---------------------------------------------------------------------------
// AparatClient
// Client-side orchestrator for the Aparat section:
//   - <Tabs.Root> binds the channel rail to the active username. Tab clicks
//     inside <ChannelHeader> flow up here via Radix context.
//   - useAparatChannel drives data for the active channel.
//   - <ChannelHeader> owns the search box + tabs (we only feed it data).
//   - Below the header: a 2-column layout
//       * Left  (2fr): <VideoPlayer> + the random videos grid
//       * Right (1fr): <Playlist>
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { useAparatChannel } from '@/hooks/use-aparat-channel';
import { ChannelHeader } from '@/components/aparat/channel-header';
import { VideoPlayer } from '@/components/aparat/video-player';
import { Playlist } from '@/components/aparat/playlist';
import { VideoCard } from '@/components/aparat/video-card';
import type { SlidingTabItem } from '@/components/aparat/sliding-tabs';

interface AparatClientProps {
  /** Channel handles (Aparat usernames) available to switch between. */
  usernames: string[];
}

export function AparatClient({ usernames }: AparatClientProps) {
  // Active channel handle. Defaults to the first provided username.
  const [activeUsername, setActiveUsername] = useState<string>(
    usernames[0] ?? '',
  );

  // Channel data hook for the active channel.
  const {
    channel, // Profile | null   -> header identity (name/avatar/followers)
    videos, // VideoListItem[]   -> playlist + search source
    selectedVideo, // VideoListItem | null -> currently playing
    randomVideos, // VideoListItem[]   -> left-column grid
    hasMore, // boolean: more playlist pages exist
    isLoadingMore, // boolean: a load-more request is in flight
    selectVideo, // (video: VideoListItem) => void
    loadMore, // () => void: fetch the next playlist page
  } = useAparatChannel(activeUsername);

  // Channel tab rail: usernames -> SlidingTabItem[] (value === username).
  const tabItems = useMemo<SlidingTabItem[]>(
    () => usernames.map((name) => ({ value: name, label: name })),
    [usernames],
  );

  return (
    // Tab clicks inside ChannelHeader's <SlidingTabs> reach this onValueChange
    // through Radix context, swapping the username fed into useAparatChannel.
    <TabsPrimitive.Root
      value={activeUsername}
      onValueChange={setActiveUsername}
      // `min-w-0` keeps the whole subtree from forcing the page wider than the
      // viewport when a child holds long, non-wrapping content.
      className="flex w-full min-w-0 flex-col gap-6"
    >
      {/* Header owns the search box + tabs; we only pass it data. */}
      <ChannelHeader
        channel={channel}
        fallbackUsername={activeUsername}
        videos={videos}
        onVideoSelect={selectVideo}
        tabs={tabItems}
        tabValue={activeUsername}
      />

      {/*
        Two-column body:
          - lg+      : [2fr | 1fr] => player+grid on the left, playlist right.
          - below lg : single column, stacked in source order.
        `items-start` keeps each column at its natural height (no stretch).
      */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left column: player on top, random videos grid beneath it. */}
        {/* `min-w-0` lets the column shrink instead of overflowing the grid. */}
        <div className="flex min-w-0 flex-col gap-6">
          <VideoPlayer video={selectedVideo} />

          {randomVideos.length > 0 && (
            <section className="flex flex-col gap-4">
              {/* Fewer columns here since the left track is narrower than a
                  full-width row would be (it shares space with the playlist). */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {randomVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    // VideoCardProps requires `isActive` (not optional).
                    isActive={selectedVideo?.id === video.id}
                    onClick={() => selectVideo(video)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column: the playlist. `min-w-0` prevents grid blow-out. */}
        <div className="min-w-0">
          <Playlist
            videos={videos}
            currentVideoId={selectedVideo?.id ?? null}
            onVideoSelect={selectVideo}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        </div>
      </div>
    </TabsPrimitive.Root>
  );
}
