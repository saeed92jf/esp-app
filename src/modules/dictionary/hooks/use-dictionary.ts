"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getDictionaryTerms,
  getDictionaryCategories,
  type DictionaryItem,
  type DictionaryCategoryItem,
} from "@/modules/home/data/engineering-dictionary-data";

const CUSTOM_TERMS_STORAGE_KEY = "esp_custom_dictionary_terms_v1";
const BOOKMARKS_STORAGE_KEY = "esp_dictionary_bookmarks_v1";

export interface CustomDictionaryTermInput {
  term: string;
  secondaryTerm?: string;
  abbreviation?: string;
  category: "materials" | "equipment" | "jargon" | "inspection" | "experience" | "corporate";
  categoryName?: string;
  shortDesc: string;
  keyTip: string;
  standards?: string[];
  tags: string[];
}

export function useDictionary(locale: string = "fa") {
  // 1. Built-in base terms
  const baseTerms = useMemo(() => getDictionaryTerms(locale), [locale]);
  const categories = useMemo(() => getDictionaryCategories(locale), [locale]);

  // 2. Custom terms loaded from localStorage
  const [customTerms, setCustomTerms] = useState<DictionaryItem[]>([]);
  // 3. Bookmarked IDs loaded from localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCustom = localStorage.getItem(CUSTOM_TERMS_STORAGE_KEY);
      if (storedCustom) {
        const parsed = JSON.parse(storedCustom);
        if (Array.isArray(parsed)) {
          setCustomTerms(parsed);
        }
      }

      const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (storedBookmarks) {
        const parsed = JSON.parse(storedBookmarks);
        if (Array.isArray(parsed)) {
          setBookmarkedIds(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load dictionary storage", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save custom terms helper
  const saveCustomTerms = useCallback((terms: DictionaryItem[]) => {
    setCustomTerms(terms);
    try {
      localStorage.setItem(CUSTOM_TERMS_STORAGE_KEY, JSON.stringify(terms));
    } catch (err) {
      console.error("Failed to save custom terms to localStorage", err);
    }
  }, []);

  // Save bookmarks helper
  const saveBookmarks = useCallback((ids: string[]) => {
    setBookmarkedIds(ids);
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      console.error("Failed to save bookmarks to localStorage", err);
    }
  }, []);

  // Combined terms (Custom terms placed at the top for immediate visibility)
  const allTerms = useMemo(() => {
    return [...customTerms, ...baseTerms];
  }, [customTerms, baseTerms]);

  // Add custom term
  const addCustomTerm = useCallback(
    (input: CustomDictionaryTermInput): DictionaryItem => {
      const categoryMapFa: Record<string, string> = {
        materials: "متریال و فولادها",
        equipment: "تجهیزات و اتصالات",
        jargon: "اصطلاحات کارگاهی",
        inspection: "بازرسی و آزمون",
        experience: "فوت‌وفن و تجربیات",
        corporate: "واژگان شرکتی و پروژه",
      };
      const categoryMapEn: Record<string, string> = {
        materials: "Materials & Metallurgy",
        equipment: "Equipment & Components",
        jargon: "Field & Workshop Jargon",
        inspection: "Inspection & Testing",
        experience: "Field Experience & Tips",
        corporate: "Corporate & Projects",
      };

      const catName =
        input.categoryName ||
        (locale === "fa"
          ? categoryMapFa[input.category] || "سایر"
          : categoryMapEn[input.category] || "Other");

      const newTerm: DictionaryItem = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        term: input.term.trim(),
        secondaryTerm: input.secondaryTerm?.trim(),
        abbreviation: input.abbreviation?.trim(),
        category: input.category,
        categoryName: catName,
        shortDesc: input.shortDesc.trim(),
        keyTip: input.keyTip.trim(),
        standards: input.standards && input.standards.length > 0 ? input.standards : undefined,
        tags: input.tags.map((t) => t.trim()).filter(Boolean),
      };

      const updated = [newTerm, ...customTerms];
      saveCustomTerms(updated);
      return newTerm;
    },
    [customTerms, locale, saveCustomTerms]
  );

  // Edit custom term
  const updateCustomTerm = useCallback(
    (id: string, input: Partial<CustomDictionaryTermInput>) => {
      const updated = customTerms.map((term) => {
        if (term.id === id) {
          return {
            ...term,
            ...input,
            term: input.term ? input.term.trim() : term.term,
            shortDesc: input.shortDesc ? input.shortDesc.trim() : term.shortDesc,
            keyTip: input.keyTip ? input.keyTip.trim() : term.keyTip,
          };
        }
        return term;
      });
      saveCustomTerms(updated);
    },
    [customTerms, saveCustomTerms]
  );

  // Delete custom term
  const deleteCustomTerm = useCallback(
    (id: string) => {
      const updated = customTerms.filter((term) => term.id !== id);
      saveCustomTerms(updated);
      // Remove from bookmarks if present
      if (bookmarkedIds.includes(id)) {
        saveBookmarks(bookmarkedIds.filter((bId) => bId !== id));
      }
    },
    [customTerms, bookmarkedIds, saveCustomTerms, saveBookmarks]
  );

  // Toggle bookmark
  const toggleBookmark = useCallback(
    (id: string) => {
      const exists = bookmarkedIds.includes(id);
      const next = exists ? bookmarkedIds.filter((item) => item !== id) : [...bookmarkedIds, id];
      saveBookmarks(next);
    },
    [bookmarkedIds, saveBookmarks]
  );

  const isBookmarked = useCallback(
    (id: string) => {
      return bookmarkedIds.includes(id);
    },
    [bookmarkedIds]
  );

  // Bookmarked items list
  const bookmarkedTerms = useMemo(() => {
    const set = new Set(bookmarkedIds);
    return allTerms.filter((term) => set.has(term.id));
  }, [allTerms, bookmarkedIds]);

  // Export custom terms as JSON
  const exportCustomJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customTerms, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `esp-custom-dictionary-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [customTerms]);

  // Export all terms as JSON
  const exportAllJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allTerms, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `esp-full-dictionary-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [allTerms]);

  // Export custom terms as CSV
  const exportCustomCSV = useCallback(() => {
    const headers = ["Term", "SecondaryTerm", "Abbreviation", "Category", "Definition", "KeyTip", "Standards", "Tags"];
    const rows = customTerms.map((t) => [
      `"${(t.term || "").replace(/"/g, '""')}"`,
      `"${(t.secondaryTerm || "").replace(/"/g, '""')}"`,
      `"${(t.abbreviation || "").replace(/"/g, '""')}"`,
      `"${(t.categoryName || "").replace(/"/g, '""')}"`,
      `"${(t.shortDesc || "").replace(/"/g, '""')}"`,
      `"${(t.keyTip || "").replace(/"/g, '""')}"`,
      `"${(t.standards?.join("; ") || "").replace(/"/g, '""')}"`,
      `"${(t.tags?.join("; ") || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `esp-custom-dictionary-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [customTerms]);

  // Import custom terms from JSON string/file
  const importCustomJSON = useCallback(
    (jsonContent: string): { success: boolean; count: number; error?: string } => {
      try {
        const parsed = JSON.parse(jsonContent);
        if (!Array.isArray(parsed)) {
          return { success: false, count: 0, error: "فایل باید حاوی آرایه‌ای از واژگان باشد." };
        }

        const validItems: DictionaryItem[] = [];
        for (const item of parsed) {
          if (item && typeof item.term === "string" && typeof item.shortDesc === "string") {
            validItems.push({
              id: item.id && item.id.startsWith("custom-") ? item.id : `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              term: item.term.trim(),
              secondaryTerm: item.secondaryTerm?.trim(),
              abbreviation: item.abbreviation?.trim(),
              category: item.category || "materials",
              categoryName: item.categoryName || (locale === "fa" ? "سایر" : "Other"),
              shortDesc: item.shortDesc.trim(),
              keyTip: item.keyTip ? item.keyTip.trim() : "",
              standards: Array.isArray(item.standards) ? item.standards : undefined,
              tags: Array.isArray(item.tags) ? item.tags : [],
            });
          }
        }

        if (validItems.length === 0) {
          return { success: false, count: 0, error: "هیچ واژه معتبری در فایل یافت نشد." };
        }

        // Merge without duplicates by term name
        const existingTermsMap = new Map(customTerms.map((t) => [t.term.toLowerCase(), t]));
        for (const item of validItems) {
          existingTermsMap.set(item.term.toLowerCase(), item);
        }

        const merged = Array.from(existingTermsMap.values());
        saveCustomTerms(merged);
        return { success: true, count: validItems.length };
      } catch (err: any) {
        return { success: false, count: 0, error: err.message || "خطا در پردازش فایل JSON" };
      }
    },
    [customTerms, locale, saveCustomTerms]
  );

  // Clear all custom terms
  const clearCustomTerms = useCallback(() => {
    saveCustomTerms([]);
  }, [saveCustomTerms]);

  return {
    allTerms,
    baseTerms,
    customTerms,
    categories,
    bookmarkedTerms,
    bookmarkedIds,
    isLoaded,
    addCustomTerm,
    updateCustomTerm,
    deleteCustomTerm,
    toggleBookmark,
    isBookmarked,
    exportCustomJSON,
    exportAllJSON,
    exportCustomCSV,
    importCustomJSON,
    clearCustomTerms,
  };
}
