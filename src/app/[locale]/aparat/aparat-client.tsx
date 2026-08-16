"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { formatViews, formatRelativeTime } from "@/modules/aparat/utils/formatters";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AparatService } from "@/services/aparat.service";
import type { Profile, VideoListItem, VideoItem, Category, Playlist } from "@/types";

import {
  ChannelInfoBar,
  VideoPlayer,
  VideoCard,
  SlidingTabs,
  ChannelVideoSearch,
} from "@/modules/aparat";

interface AparatClientProps {
  username: string;
}

interface TaggedVideo extends VideoListItem {
  _sourceChannel: string;
}

export function AparatClient({ username }: AparatClientProps) {
  const t = useTranslations("Aparat");
  const trTime = useTranslations("Aparat.time");
  const usernames = useMemo(() => [username], [username]);

  const activeTab = username;
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // استیت‌های لود دیتا از API
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [playlists, setPlaylists] = useState<Record<string, Playlist[]>>({});
  const [playlistVideos, setPlaylistVideos] = useState<Record<string, Record<string, TaggedVideo[]>>>({});
  const [playlistLoading, setPlaylistLoading] = useState<Record<string, boolean>>({});
  const [allVideos, setAllVideos] = useState<TaggedVideo[]>([]);
  const [syncStatus, setSyncStatus] = useState<Record<string, "loading" | "done" | "error">>({});

  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const usernamesKey = useMemo(() => usernames.join(','), [usernames]);

  // Load playlist videos on demand
  useEffect(() => {
    if (activeCategoryId === null || !activeTab) return;
    if (playlistVideos[activeTab]?.[activeCategoryId]) return;

    const pl = playlists[activeTab]?.find((p) => p.id === activeCategoryId);
    if (!pl) return;

    const service = new AparatService();
    const abortController = new AbortController();

    async function fetchPlaylistVideos() {
      setPlaylistLoading((prev) => ({ ...prev, [activeCategoryId!]: true }));
      try {
        const videos = await service.getPlaylistVideos(activeCategoryId!, abortController.signal);
        const tagged = videos.map((v) => ({
          ...v,
          _sourceChannel: activeTab,
        })) as TaggedVideo[];
        
        setPlaylistVideos((prev) => {
          const newState = {
            ...prev,
            [activeTab]: {
              ...(prev[activeTab] || {}),
              [activeCategoryId!]: tagged,
            },
          };
          
          try {
            const cachedStr = sessionStorage.getItem(`aparat_state_cache`);
            if (cachedStr) {
              const parsed = JSON.parse(cachedStr);
              parsed.playlistVideos = newState;
              sessionStorage.setItem(`aparat_state_cache`, JSON.stringify(parsed));
            }
          } catch (e) {}

          return newState;
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to load playlist videos", err);
        }
      } finally {
        setPlaylistLoading((prev) => ({ ...prev, [activeCategoryId!]: false }));
      }
    }

    fetchPlaylistVideos();

    return () => abortController.abort();
  }, [activeCategoryId, activeTab, playlists, playlistVideos]);

  useEffect(() => {
    if (!usernames || usernames.length === 0) {
      setLoading(false);
      return;
    }

    const service = new AparatService();
    const abortController = new AbortController();

    const CACHE_KEY = `aparat_state_cache_v3`;

    async function fetchData() {
      const cachedStr = sessionStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        try {
          const parsed = JSON.parse(cachedStr);
          if (parsed.usernamesKey === usernamesKey) {
            setProfiles(parsed.profiles);
            setPlaylists(parsed.playlists);
            setAllVideos(parsed.allVideos);
            if (parsed.playlistVideos) setPlaylistVideos(parsed.playlistVideos);
            setLoading(false);
            return; // Skip fetch if cached
          }
        } catch (e) {}
      }

      setLoading(true);
      setLoadedCount(0);
      setTotalCount(0);
      try {
        const fetchedProfiles: Record<string, Profile> = {};
        const fetchedPlaylists: Record<string, Playlist[]> = {};
        const finalAllVideos: TaggedVideo[] = [];
        const initialSyncStatus: Record<string, "loading"> = {};
        usernames.forEach((u) => {
          initialSyncStatus[u] = "loading";
        });
        setSyncStatus(initialSyncStatus);

        await Promise.all(
          usernames.map(async (user) => {
            try {
              const profile = await service.getProfile(
                user,
                abortController.signal,
              );
              if (profile) {
                fetchedProfiles[user] = profile;
                if (profile.videoCount) {
                  setTotalCount((prev) => prev + profile.videoCount!);
                }
              }

              const pls = await service.getPlaylists(user, abortController.signal);
              fetchedPlaylists[user] = pls || [];

              const generator = service.streamUserVideos(
                user,
                abortController.signal,
              );
              let r = await generator.next();
              let allTaggedForUser: TaggedVideo[] = [];

              while (!r.done && !abortController.signal.aborted) {
                if (r.value) {
                  const tagged = r.value.map((v) => ({
                    ...v,
                    _sourceChannel: user,
                  })) as TaggedVideo[];
                  allTaggedForUser.push(...tagged);
                  setLoadedCount((prev) => prev + tagged.length);
                }
                r = await generator.next();
              }

              if (!abortController.signal.aborted) {
                finalAllVideos.push(...allTaggedForUser);
                setAllVideos((prev) =>
                  [...prev, ...allTaggedForUser].sort(
                    (a, b) => b.createdAtTimestamp - a.createdAtTimestamp,
                  ),
                );
                setSyncStatus((prev) => ({ ...prev, [user]: "done" }));
              }
            } catch (err: any) {
              if (err.name !== "AbortError") {
                console.error(`Failed to load data for ${user}:`, err);
                setSyncStatus((prev) => ({ ...prev, [user]: "error" }));
              }
            }
          }),
        );

        if (!abortController.signal.aborted) {
          setProfiles(fetchedProfiles);
          setPlaylists(fetchedPlaylists);
          
          finalAllVideos.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              usernamesKey,
              profiles: fetchedProfiles,
              playlists: fetchedPlaylists,
              allVideos: finalAllVideos,
              playlistVideos: playlistVideos // might be empty initially, but it's safe
            }));
          } catch (e) {
            console.warn("sessionStorage quota exceeded or unavailable. Skipping cache.");
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Failed to load Aparat data:", error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData().catch(() => {});

    return () => {
      abortController.abort(new DOMException("Unmounted", "AbortError"));
    };
  }, [usernamesKey]);

  const channelVideos = useMemo(() => {
    return allVideos.filter((v) => v._sourceChannel === activeTab);
  }, [activeTab, allVideos]);

  const displayedVideos = useMemo(() => {
    if (activeCategoryId !== null) {
      return playlistVideos[activeTab]?.[activeCategoryId] || [];
    }
    return channelVideos;
  }, [activeCategoryId, channelVideos, activeTab, playlistVideos]);

  const [videoLoading, setVideoLoading] = useState(false);

  const handleVideoSelect = async (video: VideoItem) => {
    setVideoLoading(true);
    setSelectedVideo(video);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const service = new AparatService();
      const fullVideo = await service.getVideoInfo(video.uid);
      setSelectedVideo(fullVideo);
    } catch (err) {
      console.error("Failed to load full video info", err);
    } finally {
      setVideoLoading(false);
    }
  };

  if (!username) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        هیچ کانال آپاراتی مشخص نشده است.
      </div>
    );
  }

  const activeProfile = profiles[activeTab] || null;

  return (
    <div className="flex flex-col relative w-full h-full overflow-y-auto custom-scrollbar pb-12">
      <div className="w-full px-4 md:px-8 mt-4 mx-auto">
        {loading ? (
          <div className="flex flex-col min-h-[30vh] items-center justify-center gap-4 mt-12">
            <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
            {totalCount > 0 && (
              <div className="text-muted-foreground text-sm font-medium fa-num">
                {t("loadingVideos", { loaded: loadedCount, total: totalCount })}
              </div>
            )}
          </div>
        ) : (
          <>
                <div className="flex flex-col w-full">
                  
                  {/* 1. Video Player & Info (Only if video is selected) */}
                  {selectedVideo && (
                    <div className="w-full max-w-5xl mx-auto mb-8 animate-in slide-in-from-top-4 fade-in duration-500">
                      <div className="w-full bg-black aspect-video relative z-10 shadow-lg md:rounded-2xl overflow-hidden">
                         <VideoPlayer video={selectedVideo} />
                      </div>
                      <div className="mt-6 px-4 text-center flex flex-col items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-black text-foreground leading-normal md:leading-relaxed">{selectedVideo.title}</h2>
                        <div className="flex items-center gap-3 text-muted-foreground text-base font-semibold fa-num mt-2">
                          <span>{formatViews(selectedVideo.visit_cnt)} {t("views")}</span>
                          <span className="opacity-50">•</span>
                          <span>{formatRelativeTime(selectedVideo.createdAtTimestamp, trTime, selectedVideo.sdate)}</span>
                        </div>
                        {selectedVideo.description && (
                          <div className="w-full text-justify text-[13px] text-muted-foreground mt-5 leading-8 md:leading-9 bg-muted/30 p-6 rounded-2xl border border-border/50 max-h-80 overflow-y-auto custom-scrollbar">
                            <div dangerouslySetInnerHTML={{ __html: selectedVideo.description.replace(/\n/g, '<br/>') }} />
                          </div>
                        )}
                        {videoLoading && !selectedVideo.description && (
                          <div className="w-full h-20 animate-pulse bg-muted/30 rounded-xl border border-border/50 mt-4" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. Channel Identity (Logo, Name, Stats & Search) */}
                  <div className="w-full mb-8">
                    <ChannelInfoBar
                      name={activeProfile?.name || activeTab}
                      avatar={activeProfile?.avatar}
                      followers={activeProfile?.followers}
                      videoCount={activeProfile?.videoCount}
                      official={activeProfile?.official}
                      description={activeProfile?.description}
                      totalVisits={activeProfile?.totalVisits}
                      monthVisits={activeProfile?.monthVisits}
                      startDate={activeProfile?.startDate}
                      searchNode={
                        <ChannelVideoSearch videos={channelVideos} onSelect={(v) => handleVideoSelect(v as VideoItem)} />
                      }
                    />
                  </div>

                  {/* 3. Playlist Filters */}
                  <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto">
                    {playlists[activeTab] && playlists[activeTab].length > 0 && (
                      <div className="w-full overflow-x-auto custom-scrollbar pb-2 pt-1">
                        <div className="flex items-center gap-2 w-max mx-auto md:mx-0 px-4 md:px-0">
                          <button
                            onClick={() => setActiveCategoryId(null)}
                            className={cn(
                              "px-6 py-3 rounded-full text-base font-bold transition-colors whitespace-nowrap shadow-sm",
                              activeCategoryId === null
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border/60"
                            )}
                          >
                            همه ویدیوها
                          </button>
                          {playlists[activeTab].filter((pl) => pl.count > 0).map((pl) => {
                            return (
                              <button
                                key={pl.id}
                                onClick={() => setActiveCategoryId(pl.id)}
                                className={cn(
                                  "px-6 py-3 rounded-full text-base font-bold transition-colors whitespace-nowrap shadow-sm fa-num",
                                  activeCategoryId === pl.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border/60"
                                )}
                              >
                                {pl.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Video Grid */}
                    <div className="mt-4 outline-none px-4 md:px-0">
                      {activeCategoryId !== null && playlistLoading[activeCategoryId] ? (
                        <div className="flex min-h-[20vh] items-center justify-center rounded-xl border border-dashed">
                          <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
                        </div>
                      ) : displayedVideos.length === 0 ? (
                        <div className="flex min-h-[20vh] items-center justify-center rounded-xl border border-dashed text-muted-foreground text-base">
                          <p>{t("noVideosFound")}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                          {displayedVideos.map((video) => (
                            <VideoCard
                              key={video.id}
                              video={video as VideoItem}
                              isActive={selectedVideo?.id === video.id}
                              onClick={() => handleVideoSelect(video as VideoItem)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
          </>
        )}
      </div>
    </div>
  );
}
