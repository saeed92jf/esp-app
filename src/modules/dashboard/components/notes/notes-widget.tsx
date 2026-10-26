"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Plus,
  Search as SearchIcon,
  Pin,
  Trash2,
  Tag,
  Check,
  X,
  Palette,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import type { DashboardNote } from "../../services/dashboard.service";

interface NotesWidgetProps {
  initialNotes?: DashboardNote[];
  className?: string;
  isCompact?: boolean;
}

const COLOR_CLASSES: Record<
  DashboardNote["color"],
  { card: string; badge: string; dot: string }
> = {
  yellow: {
    card: "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
  blue: {
    card: "border-sky-500/30 bg-sky-500/5 hover:border-sky-500/50",
    badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dot: "bg-sky-500",
  },
  emerald: {
    card: "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  rose: {
    card: "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50",
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dot: "bg-rose-500",
  },
  purple: {
    card: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50",
    badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dot: "bg-purple-500",
  },
  slate: {
    card: "border-border/50 bg-card/60 hover:border-border/80",
    badge: "bg-muted text-muted-foreground border-border/40",
    dot: "bg-muted-foreground",
  },
};

const STORAGE_KEY = "dashboard_user_notes_v1";

export function NotesWidget({
  initialNotes = [],
  className,
  isCompact = false,
}: NotesWidgetProps) {
  const t = useTranslations("Dashboard.notes");
  const locale = useLocale();

  const [notes, setNotes] = React.useState<DashboardNote[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialNotes;
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState<string>("all");
  const [isAdding, setIsAdding] = React.useState(false);

  // New Note Form State
  const [newTitle, setNewTitle] = React.useState("");
  const [newContent, setNewContent] = React.useState("");
  const [newTags, setNewTags] = React.useState("");
  const [newColor, setNewColor] = React.useState<DashboardNote["color"]>("blue");

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    notes.forEach((n) => n.tags.forEach((tg) => tags.add(tg)));
    return Array.from(tags);
  }, [notes]);

  const tagOptions = React.useMemo(() => {
    const opts = [
      {
        value: "all",
        label: t("all"),
        icon: <Tag className="size-3.5 text-primary" />,
        hint: notes.length.toString(),
      },
    ];
    allTags.forEach((tg) => {
      const count = notes.filter((n) => n.tags.includes(tg)).length;
      opts.push({
        value: tg,
        label: `#${tg}`,
        icon: <Tag className="size-3.5 text-muted-foreground" />,
        hint: count.toString(),
      });
    });
    return opts;
  }, [allTags, notes, t]);

  const filteredNotes = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notes
      .filter((note) => {
        const matchesQuery =
          !q ||
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q) ||
          note.tags.some((tg) => tg.toLowerCase().includes(q));

        const matchesTag =
          selectedTag === "all" || note.tags.includes(selectedTag);

        return matchesQuery && matchesTag;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.id.localeCompare(a.id);
      });
  }, [notes, searchQuery, selectedTag]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;

    const parsedTags = newTags
      .split(/[,،\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const createdNote: DashboardNote = {
      id: `note-${Date.now()}`,
      title: newTitle.trim() || t("untitled"),
      content: newContent.trim(),
      color: newColor,
      isPinned: false,
      tags: parsedTags,
      createdAt:
        locale === "fa"
          ? new Intl.DateTimeFormat("fa-IR").format(new Date())
          : new Date().toLocaleDateString(),
    };

    setNotes((prev) => [createdNote, ...prev]);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
    setNewColor("blue");
    setIsAdding(false);
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 bg-panel dark:bg-card/40 rounded-2xl border border-border/50 overflow-hidden relative p-3.5 sm:p-4 gap-3 @container",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 shrink-0 pe-18 sm:pe-20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-primary/10 rounded-xl shrink-0 text-primary">
            <FileText className="size-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground/90 leading-none truncate">
              {t("title")}
            </h3>
            <span className="text-[11px] text-muted-foreground truncate block">
              {t("subtitle", { count: notes.length })}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant={isAdding ? "outline" : "default"}
          onClick={() => setIsAdding(!isAdding)}
          className="h-8 text-xs gap-1.5 px-2.5 font-medium shadow-xs shrink-0"
        >
          {isAdding ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
          <span>{isAdding ? t("cancel") : t("newNote")}</span>
        </Button>
      </div>

      {/* ── Add Note Drawer / Inline Form ── */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddNote}
            className="flex flex-col gap-2.5 p-3 rounded-xl bg-white dark:bg-card border border-border/70 shadow-sm shrink-0 overflow-hidden"
          >
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              className="h-8.5 text-xs bg-muted/30 border-border/50"
              autoFocus
            />
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={t("contentPlaceholder")}
              className="text-xs min-h-[70px] bg-muted/30 border-border/50 resize-none"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
              {/* Color choices */}
              <div className="flex items-center gap-1.5">
                {(["blue", "yellow", "emerald", "purple", "rose", "slate"] as const).map(
                  (col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewColor(col)}
                      className={cn(
                        "size-5 rounded-full transition-all flex items-center justify-center border",
                        COLOR_CLASSES[col].dot,
                        newColor === col
                          ? "ring-2 ring-primary ring-offset-1 scale-105"
                          : "opacity-70 hover:opacity-100"
                      )}
                    >
                      {newColor === col && (
                        <Check className="size-3 text-white dark:text-black" />
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Tags input */}
              <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                <Input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder={t("tagsPlaceholder")}
                  className="h-7 text-[11px] bg-muted/30 border-border/50"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                className="h-7 text-xs px-3 shadow-xs"
              >
                {t("save")}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── Search & Tag/Category Filter (Combobox in front of search) ── */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex-1 min-w-0">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-8 pe-7 h-8 text-xs bg-white dark:bg-card border-border/50 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <div className="w-32 sm:w-40 shrink-0">
          <Combobox
            options={tagOptions}
            value={selectedTag}
            onChange={(val) => setSelectedTag(val || "all")}
            placeholder={t("all")}
            size="sm"
            allowClear={false}
            showSearch={allTags.length > 5}
            triggerClassName="h-8 text-xs bg-white dark:bg-card border-border/50 shadow-xs"
          />
        </div>
      </div>

      {/* ── Notes Grid / List ── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pe-1">
        {filteredNotes.length > 0 ? (
          <div
            className={cn(
              "grid gap-2.5",
              isCompact ? "grid-cols-1" : "grid-cols-1 @[380px]:grid-cols-2 @[750px]:grid-cols-3"
            )}
          >
            {filteredNotes.map((note) => {
              const colorStyle = COLOR_CLASSES[note.color] || COLOR_CLASSES.slate;
              return (
                <div
                  key={note.id}
                  className={cn(
                    "relative p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between group/note shadow-xs",
                    colorStyle.card
                  )}
                >
                  {/* Top Bar: Title + Pin + Delete */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="font-semibold text-xs sm:text-sm text-foreground/90 line-clamp-1">
                      {note.title}
                    </h4>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(note.id, e)}
                        title={note.isPinned ? t("unpin") : t("pin")}
                        className={cn(
                          "p-1 rounded-md transition-colors",
                          note.isPinned
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Pin
                          className={cn(
                            "size-3.5",
                            note.isPinned && "fill-current"
                          )}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        title={t("delete")}
                        className="p-1 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover/note:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Note Body */}
                  <p className="text-xs text-foreground/75 whitespace-pre-wrap line-clamp-4 leading-relaxed mb-3">
                    {note.content}
                  </p>

                  {/* Footer: Tags + Date */}
                  <div className="flex items-center justify-between gap-1.5 text-[10px] text-muted-foreground pt-1.5 border-t border-border/30">
                    <div className="flex items-center gap-1 flex-wrap line-clamp-1">
                      {note.tags.map((tg) => (
                        <span
                          key={tg}
                          className={cn(
                            "px-1.5 py-0.5 rounded-md border text-[10px] font-medium leading-none",
                            colorStyle.badge
                          )}
                        >
                          #{tg}
                        </span>
                      ))}
                    </div>

                    <span className="shrink-0 text-[10px] opacity-70 fa-num">
                      {note.createdAt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
            <FileText className="size-8 mb-2 opacity-25" />
            <p className="text-xs font-medium">{t("empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
