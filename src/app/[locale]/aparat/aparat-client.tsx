"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AparatService } from "@/services/aparat.service";
import type { Profile, VideoListItem, VideoItem } from "@/types";

import {
  ChannelHeader,
  ChannelStats,
  VideoPlayer,
  Playlist,
  VideoCard,
} from "@/modules/aparat";

interface AparatClientProps {
  usernames: string[];
}

interface TaggedVideo extends VideoListItem {
  _sourceChannel: string;
}

export function AparatClient({ usernames }: AparatClientProps) {
  const t = useTranslations("Aparat");

  const [activeTab, setActiveTab] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // استیت‌های لود دیتا از API
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [allVideos, setAllVideos] = useState<TaggedVideo[]>([]);

  useEffect(() => {
    if (!usernames || usernames.length === 0) {
      setLoading(false);
      return;
    }

    const service = new AparatService();
    const abortController = new AbortController();

    async function fetchData() {
      setLoading(true);
      try {
        const fetchedProfiles: Record<string, Profile> = {};
        let fetchedVideos: TaggedVideo[] = [];

        await Promise.all(
          usernames.map(async (user) => {
            try {
              const profile = await service.getProfile(
                user,
                abortController.signal,
              );
              if (profile) {
                fetchedProfiles[user] = profile;
              }

              const generator = service.streamUserVideos(
                user,
                abortController.signal,
              );
              const result = await generator.next();

              if (!result.done && result.value) {
                const tagged = result.value.map((v) => ({
                  ...v,
                  _sourceChannel: user,
                })) as TaggedVideo[];

                fetchedVideos = [...fetchedVideos, ...tagged];
              }
            } catch (err: any) {
              if (err.name !== "AbortError") {
                console.error(`Failed to load data for ${user}:`, err);
              }
            }
          }),
        );

        fetchedVideos.sort(
          (a, b) => b.createdAtTimestamp - a.createdAtTimestamp,
        );

        setProfiles(fetchedProfiles);
        setAllVideos(fetchedVideos);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Failed to load Aparat data:", error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [usernames]);

  const displayedVideos = useMemo(() => {
    if (activeTab === "all") return allVideos;
    return allVideos.filter((v) => v._sourceChannel === activeTab);
  }, [activeTab, allVideos]);

  useEffect(() => {
    if (displayedVideos.length > 0) {
      const stillExists = displayedVideos.some(
        (v) => v.id === selectedVideo?.id,
      );
      if (!stillExists) {
        setSelectedVideo(displayedVideos[0] as VideoItem);
      }
    } else {
      setSelectedVideo(null);
    }
  }, [displayedVideos, selectedVideo]);

  if (usernames.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        هیچ کانال آپاراتی در فایل .env.local (NEXT_PUBLIC_APARAT_USERNAMES)
        تنظیم نشده است.
      </div>
    );
  }

  const tabs = [
    { value: "all", label: t("allVideos") },
    ...usernames.map((u) => ({
      value: u,
      label: profiles[u]?.name || u,
    })),
  ];

  const activeProfile =
    activeTab === "all"
      ? profiles[usernames[0]] || null
      : profiles[activeTab] || null;

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col gap-6"
    >
      <ChannelHeader
        channel={activeProfile}
        fallbackUsername={activeTab === "all" ? usernames[0] : activeTab}
        videos={displayedVideos}
        onVideoSelect={(v) => setSelectedVideo(v as VideoItem)}
        tabs={tabs}
        tabValue={activeTab}
      />

      <div className="container mx-auto max-w-7xl px-4 pb-12">
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mb-8 mt-4">
              <ChannelStats
                videoCount={displayedVideos.length}
                followerCount={activeProfile?.followers || 0}
                followedCount={activeTab === "all" ? usernames.length - 1 : 0}
                official={true}
              />
            </div>

            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="mt-0 outline-none"
              >
                {displayedVideos.length === 0 ? (
                  <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                    <p>{t("noVideos")}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 xl:gap-8">
                      <div className="lg:col-span-2">
                        <VideoPlayer video={selectedVideo} />
                      </div>

                      <div className="lg:col-span-1">
                        <Playlist
                          videos={displayedVideos}
                          currentVideoId={selectedVideo?.id}
                          onVideoSelect={(v) =>
                            setSelectedVideo(v as VideoItem)
                          }
                          className="sticky top-30 max-h-[calc(100vh-140px)]"
                        />
                      </div>
                    </div>

                    {displayedVideos.length > 1 && (
                      <div className="mt-12">
                        <h3 className="mb-6 text-xl font-bold">
                          {t("youMightLike")}
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                          {displayedVideos
                            .filter((v) => v.id !== selectedVideo?.id)
                            .map((video) => (
                              <VideoCard
                                key={video.id}
                                video={video as VideoItem}
                                onClick={() =>
                                  setSelectedVideo(video as VideoItem)
                                }
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </>
        )}
      </div>
    </Tabs>
  );
}
