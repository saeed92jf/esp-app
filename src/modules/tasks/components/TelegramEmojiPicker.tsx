"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Smiley } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { EmojiClickData } from "emoji-picker-react";
import { EmojiStyle, Theme } from "emoji-picker-react";

// Lazy-load EmojiPicker with SSR disabled for zero hydration lag and zero bundle blocking
const DynamicEmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="w-[320px] h-[350px] flex flex-col items-center justify-center gap-2 bg-white/95 dark:bg-zinc-900/95 rounded-2xl">
      <div className="size-6 border-2 border-[#2481cc] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-muted-foreground font-sans">در حال بارگذاری شکلک‌ها...</span>
    </div>
  ),
});

const QUICK_EMOJIS = ["👍", "❤️", "🔥", "😂", "👏", "🎉", "🤩", "🙏", "👌", "🚀", "💯", "✨"];

interface TelegramEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  isRtl: boolean;
}

export const TelegramEmojiPicker = React.memo(function TelegramEmojiPicker({
  onSelectEmoji,
  isRtl,
}: TelegramEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // 200ms grace period for smooth cursor transit between button & popover
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      onSelectEmoji(emojiData.emoji);
    },
    [onSelectEmoji]
  );

  const handleQuickEmoji = useCallback(
    (emoji: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectEmoji(emoji);
    },
    [onSelectEmoji]
  );

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button: Pill-shaped, Telegram style */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "size-9 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-[#2481cc] dark:hover:text-[#67b5ff] flex items-center justify-center shrink-0 cursor-pointer transition-colors group",
          isOpen && "text-[#2481cc] bg-black/5 dark:bg-white/10"
        )}
        title={isRtl ? "انتخاب شکلک (اموجی)" : "Pick Emoji"}
      >
        <Smiley size={26} weight="regular" className="transition-transform group-hover:scale-105" />
      </button>

      {/* Floating Popover: Hardware-accelerated CSS transition */}
      <div
        className={cn(
          "absolute bottom-full mb-3.5 z-50 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden transition-all duration-150 ease-out origin-bottom",
          isRtl ? "left-0" : "right-0",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none invisible"
        )}
        style={{ width: "330px" }}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Telegram Top Quick Reaction Bar */}
        <div className="flex items-center justify-between gap-1 p-2 bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/5 dark:border-white/5 overflow-x-auto scrollbar-none">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={(e) => handleQuickEmoji(emoji, e)}
              className="size-7 flex items-center justify-center text-lg rounded-lg hover:bg-black/10 dark:hover:bg-white/15 hover:scale-125 transition-transform cursor-pointer shrink-0"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* EmojiPicker with Native fast rendering & No Bottom Preview */}
        {isOpen && (
          <DynamicEmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={isDark ? Theme.DARK : Theme.LIGHT}
            emojiStyle={EmojiStyle.NATIVE}
            lazyLoadEmojis={true}
            searchDisabled={false}
            searchPlaceHolder={isRtl ? "جستجوی اموجی..." : "Search emojis..."}
            skinTonesDisabled={true}
            previewConfig={{ showPreview: false }}
            width="100%"
            height={360}
          />
        )}
      </div>
    </div>
  );
});

