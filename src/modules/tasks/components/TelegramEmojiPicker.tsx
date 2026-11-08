"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Smiley, MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  EmojiPicker,
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
} from "frimousse";

const QUICK_EMOJIS = ["👍", "❤️", "🔥", "😂", "👏", "🎉", "🤩", "🙏", "👌", "🚀", "💯", "✨"];

function EmojiPickerRow({ children, ...props }: EmojiPickerListRowProps) {
  return (
    <div {...props} className="scroll-my-1 px-1 flex items-center justify-between" data-slot="emoji-picker-row">
      {children}
    </div>
  );
}

function EmojiPickerEmoji({ emoji, className, ...props }: EmojiPickerListEmojiProps) {
  return (
    <button
      {...props}
      type="button"
      className={cn(
        "flex size-9 items-center justify-center rounded-lg text-xl hover:bg-black/10 dark:hover:bg-white/15 hover:scale-120 transition-transform cursor-pointer select-none",
        className
      )}
      data-slot="emoji-picker-emoji"
    >
      {emoji.emoji}
    </button>
  );
}

function EmojiPickerCategoryHeader({ category, ...props }: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      {...props}
      className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs text-muted-foreground px-2.5 pb-1 pt-2.5 text-xs font-semibold leading-none select-none sticky top-0 z-10"
      data-slot="emoji-picker-category-header"
    >
      {category.label}
    </div>
  );
}

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
    // 220ms grace period for smooth cursor transit between button & popover
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
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

      {/* Floating Popover: Ultra-fast Frimousse Emoji Picker */}
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

        {/* Frimousse Ultra-Fast Virtualized Picker */}
        {isOpen && (
          <EmojiPicker.Root
            onEmojiSelect={({ emoji }) => onSelectEmoji(emoji)}
            emojibaseUrl="/emojibase"
            columns={8}
            className="flex flex-col w-full h-[360px] text-slate-800 dark:text-slate-100 select-none"
          >
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-black/5 dark:border-white/5">
              <MagnifyingGlass size={16} className="text-muted-foreground shrink-0 opacity-70" />
              <EmojiPicker.Search
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-muted-foreground outline-none border-none py-1"
                placeholder={isRtl ? "جستجوی شکلک..." : "Search emojis..."}
              />
            </div>

            {/* Virtualized Viewport */}
            <EmojiPicker.Viewport className="h-[280px] overflow-y-auto overflow-x-hidden scrollbar-thin outline-none relative select-none">
              <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs gap-2">
                <div className="size-5 border-2 border-[#2481cc] border-t-transparent rounded-full animate-spin" />
                <span>{isRtl ? "در حال بارگذاری..." : "Loading emojis..."}</span>
              </EmojiPicker.Loading>
              <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                {isRtl ? "شکلکی یافت نشد" : "No emoji found"}
              </EmojiPicker.Empty>
              <EmojiPicker.List
                className="pb-2"
                components={{
                  Row: EmojiPickerRow,
                  Emoji: EmojiPickerEmoji,
                  CategoryHeader: EmojiPickerCategoryHeader,
                }}
              />
            </EmojiPicker.Viewport>

            {/* Bottom Active Emoji Preview */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-xs h-8">
              <EmojiPicker.ActiveEmoji>
                {({ emoji }) =>
                  emoji ? (
                    <>
                      <span className="text-base leading-none">{emoji.emoji}</span>
                      <span className="text-muted-foreground truncate font-sans text-[11px]">{emoji.label}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground/60 text-[11px]">
                      {isRtl ? "شکلک را انتخاب نمایید" : "Select an emoji"}
                    </span>
                  )
                }
              </EmojiPicker.ActiveEmoji>
            </div>
          </EmojiPicker.Root>
        )}
      </div>
    </div>
  );
});
