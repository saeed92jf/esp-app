import * as React from "react";
import { cn } from "@/lib/utils";
import { BadgeCheck, Clapperboard, Calendar, Eye, Users } from "lucide-react";

interface ChannelInfoBarProps {
  name: string;
  avatar?: string;
  followers?: string;
  videoCount?: number;
  official?: boolean;
  description?: string;
  totalVisits?: string;
  monthVisits?: string;
  startDate?: string;
  searchNode?: React.ReactNode;
  className?: string;
}

export function ChannelInfoBar({
  name,
  avatar,
  followers,
  videoCount,
  official,
  description,
  totalVisits,
  monthVisits,
  startDate,
  searchNode,
  className,
}: ChannelInfoBarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className={cn("flex flex-col items-center pt-4 pb-4 w-full", className)}>
      
      {/* Avatar */}
      <div className="flex flex-col items-center relative z-10 transition-all duration-500">
        <div className="size-20 md:size-24 shrink-0 rounded-full bg-background p-1.5 shadow-sm">
          <div className="size-full rounded-full bg-primary/10 overflow-hidden flex items-center justify-center relative">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={name} className="size-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-3xl">{initials}</span>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{name}</h1>
        {official && (
          <BadgeCheck className="size-5 text-blue-500 shrink-0 fill-blue-500 text-white" aria-label="Official Channel" />
        )}
      </div>

      {searchNode && (
        <div className="w-full max-w-xl mt-4 px-4">
          {searchNode}
        </div>
      )}

      <div className="w-full max-w-4xl mt-6 px-4 flex flex-col gap-4">
        {/* About Channel Card */}
        {description && (
          <div className="w-full bg-muted/30 rounded-2xl p-6 border border-border/50 text-center">
            <h3 className="font-bold text-base mb-3 text-foreground">{t("channelInfo")}</h3>
            <p className="text-xs text-muted-foreground font-medium leading-7 md:leading-8 text-center">
              {description}
            </p>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          {/* Followers */}
          <div className="bg-muted/30 rounded-2xl p-4 flex flex-col items-center justify-center border border-border/50 hover:border-border transition-colors text-center">
            <Users className="size-6 text-muted-foreground mb-3 stroke-[1.5]" />
            <span className="text-sm text-muted-foreground mb-1">{t("followers")}</span>
            <span className="text-xl font-bold fa-num text-foreground">{followers ?? "-"}</span>
          </div>
          {/* Video Count */}
          <div className="bg-muted/30 rounded-2xl p-4 flex flex-col items-center justify-center border border-border/50 hover:border-border transition-colors text-center">
            <Clapperboard className="size-6 text-muted-foreground mb-3 stroke-[1.5]" />
            <span className="text-sm text-muted-foreground mb-1">{t("videosCount")}</span>
            <span className="text-xl font-bold fa-num text-foreground">{videoCount ?? "-"}</span>
          </div>

          {/* Start Date */}
          <div className="bg-muted/30 rounded-2xl p-4 flex flex-col items-center justify-center border border-border/50 hover:border-border transition-colors text-center">
            <Calendar className="size-6 text-muted-foreground mb-3 stroke-[1.5]" />
            <span className="text-sm text-muted-foreground mb-1">{t("startDate")}</span>
            <span className="text-xl font-bold fa-num text-foreground" dir="ltr">{startDate ? startDate.split(" ")[0].replace(/-/g, "/") : "-"}</span>
          </div>

          {/* Total Visits */}
          <div className="bg-muted/30 rounded-2xl p-4 flex flex-col items-center justify-center border border-border/50 hover:border-border transition-colors text-center">
            <Eye className="size-6 text-muted-foreground mb-3 stroke-[1.5]" />
            <span className="text-sm text-muted-foreground mb-1">{t("totalViews")}</span>
            <span className="text-xl font-bold fa-num text-foreground">{totalVisits ?? "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
