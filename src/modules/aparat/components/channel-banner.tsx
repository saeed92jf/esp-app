import * as React from "react";
import { cn } from "@/lib/utils";

interface ChannelBannerProps {
  coverSrc?: string | null;
  className?: string;
}

export function ChannelBanner({ coverSrc, className }: ChannelBannerProps) {
  return (
    <div
      className={cn(
        "relative w-full h-[120px] md:h-[180px] lg:h-[240px] overflow-hidden shrink-0",
        !coverSrc && "bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40",
        className
      )}
    >
      {/* Fallback pattern if no cover */}
      {!coverSrc && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />
      )}

      {/* Actual cover image */}
      {coverSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverSrc}
          alt="Channel Banner"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
