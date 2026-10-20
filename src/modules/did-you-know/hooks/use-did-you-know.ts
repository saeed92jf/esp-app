"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getDidYouKnowCards,
  type DidYouKnowCardItem,
} from "@/modules/home/data/did-you-know-data";

const CUSTOM_CARDS_STORAGE_KEY = "esp_custom_dyk_cards_v1";
const BOOKMARKS_STORAGE_KEY = "esp_dyk_bookmarks_v1";

export interface CustomCardInput {
  title: string;
  category: string;
  tag: string;
  description: string;
  formula: string;
  ref: string;
  link?: string;
  themeColor?: "blue" | "emerald" | "amber" | "purple" | "rose" | "cyan";
}

const THEME_PRESETS = {
  blue: {
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    glowGradient: "from-blue-500/15 via-cyan-500/10 to-transparent",
    borderAccent: "hover:border-blue-500/40",
  },
  emerald: {
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    glowGradient: "from-emerald-500/15 via-teal-500/10 to-transparent",
    borderAccent: "hover:border-emerald-500/40",
  },
  amber: {
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    glowGradient: "from-amber-500/15 via-orange-500/10 to-transparent",
    borderAccent: "hover:border-amber-500/40",
  },
  purple: {
    accent: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
    glowGradient: "from-purple-500/15 via-fuchsia-500/10 to-transparent",
    borderAccent: "hover:border-purple-500/40",
  },
  rose: {
    accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    glowGradient: "from-rose-500/15 via-pink-500/10 to-transparent",
    borderAccent: "hover:border-rose-500/40",
  },
  cyan: {
    accent: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25",
    glowGradient: "from-cyan-500/15 via-sky-500/10 to-transparent",
    borderAccent: "hover:border-cyan-500/40",
  },
};

export function useDidYouKnow(locale: string = "fa") {
  const baseCards = useMemo(() => getDidYouKnowCards(locale), [locale]);
  const [customCards, setCustomCards] = useState<DidYouKnowCardItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedCustom = localStorage.getItem(CUSTOM_CARDS_STORAGE_KEY);
      if (storedCustom) {
        const parsed = JSON.parse(storedCustom);
        if (Array.isArray(parsed)) setCustomCards(parsed);
      }

      const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (storedBookmarks) {
        const parsed = JSON.parse(storedBookmarks);
        if (Array.isArray(parsed)) setBookmarkedIds(parsed);
      }
    } catch (err) {
      console.error("Failed to load Did-You-Know storage", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveCustomCards = useCallback((cards: DidYouKnowCardItem[]) => {
    setCustomCards(cards);
    try {
      localStorage.setItem(CUSTOM_CARDS_STORAGE_KEY, JSON.stringify(cards));
    } catch (err) {
      console.error("Failed to save custom dyk cards", err);
    }
  }, []);

  const saveBookmarks = useCallback((ids: string[]) => {
    setBookmarkedIds(ids);
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      console.error("Failed to save dyk bookmarks", err);
    }
  }, []);

  const allCards = useMemo(() => {
    return [...customCards, ...baseCards];
  }, [customCards, baseCards]);

  const addCustomCard = useCallback(
    (input: CustomCardInput): DidYouKnowCardItem => {
      const theme = THEME_PRESETS[input.themeColor || "cyan"];
      const newCard: DidYouKnowCardItem = {
        id: `custom-dyk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: input.category.trim(),
        tag: input.tag.trim() || (locale === "fa" ? "نکته تخصصی" : "Engineering Tip"),
        title: input.title.trim(),
        description: input.description.trim(),
        formula: input.formula.trim(),
        ref: input.ref.trim() || (locale === "fa" ? "استاندارد مهندسی" : "Engineering Standard"),
        link: input.link?.trim() || "https://en.wikipedia.org",
        accent: theme.accent,
        glowGradient: theme.glowGradient,
        borderAccent: theme.borderAccent,
      };

      const updated = [newCard, ...customCards];
      saveCustomCards(updated);
      return newCard;
    },
    [customCards, locale, saveCustomCards]
  );

  const deleteCustomCard = useCallback(
    (id: string) => {
      const updated = customCards.filter((c) => c.id !== id);
      saveCustomCards(updated);
      if (bookmarkedIds.includes(id)) {
        saveBookmarks(bookmarkedIds.filter((bId) => bId !== id));
      }
    },
    [customCards, bookmarkedIds, saveCustomCards, saveBookmarks]
  );

  const toggleBookmark = useCallback(
    (id: string) => {
      const exists = bookmarkedIds.includes(id);
      const next = exists ? bookmarkedIds.filter((item) => item !== id) : [...bookmarkedIds, id];
      saveBookmarks(next);
    },
    [bookmarkedIds, saveBookmarks]
  );

  const isBookmarked = useCallback(
    (id: string) => bookmarkedIds.includes(id),
    [bookmarkedIds]
  );

  const bookmarkedCards = useMemo(() => {
    const set = new Set(bookmarkedIds);
    return allCards.filter((c) => set.has(c.id));
  }, [allCards, bookmarkedIds]);

  const exportJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allCards, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `esp-did-you-know-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [allCards]);

  const importJSON = useCallback(
    (jsonContent: string): { success: boolean; count: number; error?: string } => {
      try {
        const parsed = JSON.parse(jsonContent);
        if (!Array.isArray(parsed)) {
          return { success: false, count: 0, error: "فایل باید حاوی آرایه‌ای از کارت‌ها باشد." };
        }

        const validCards: DidYouKnowCardItem[] = [];
        for (const item of parsed) {
          if (item && typeof item.title === "string" && typeof item.description === "string") {
            const theme = THEME_PRESETS.blue;
            validCards.push({
              id: item.id && item.id.startsWith("custom-dyk-") ? item.id : `custom-dyk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              category: item.category || (locale === "fa" ? "مهندسی مکانیک" : "Mechanical Engineering"),
              tag: item.tag || (locale === "fa" ? "نکته تخصصی" : "Engineering Tip"),
              title: item.title.trim(),
              description: item.description.trim(),
              formula: item.formula || "",
              ref: item.ref || "Engineering Code",
              link: item.link || "https://en.wikipedia.org",
              accent: item.accent || theme.accent,
              glowGradient: item.glowGradient || theme.glowGradient,
              borderAccent: item.borderAccent || theme.borderAccent,
            });
          }
        }

        if (validCards.length === 0) {
          return { success: false, count: 0, error: "هیچ کارت معتبری در فایل یافت نشد." };
        }

        const map = new Map(customCards.map((c) => [c.title.toLowerCase(), c]));
        for (const c of validCards) {
          map.set(c.title.toLowerCase(), c);
        }

        saveCustomCards(Array.from(map.values()));
        return { success: true, count: validCards.length };
      } catch (err: any) {
        return { success: false, count: 0, error: err.message || "خطا در پردازش فایل" };
      }
    },
    [customCards, locale, saveCustomCards]
  );

  return {
    allCards,
    baseCards,
    customCards,
    bookmarkedCards,
    bookmarkedIds,
    isLoaded,
    addCustomCard,
    deleteCustomCard,
    toggleBookmark,
    isBookmarked,
    exportJSON,
    importJSON,
  };
}
