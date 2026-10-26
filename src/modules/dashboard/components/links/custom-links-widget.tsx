"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Link as LinkIcon,
  ExternalLink,
  Plus,
  Search as SearchIcon,
  Copy,
  Check,
  Trash2,
  Folder,
  Globe,
  Layers,
  X,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import type { CustomLink } from "../../services/dashboard.service";

interface CustomLinksWidgetProps {
  initialLinks?: CustomLink[];
  className?: string;
  isCompact?: boolean;
}

const STORAGE_KEY = "dashboard_user_custom_links_v1";

export function CustomLinksWidget({
  initialLinks = [],
  className,
  isCompact = false,
}: CustomLinksWidgetProps) {
  const t = useTranslations("Dashboard.links");
  const locale = useLocale();

  const [links, setLinks] = React.useState<CustomLink[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialLinks;
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [isAdding, setIsAdding] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = React.useState("");
  const [newUrl, setNewUrl] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [isInternal, setIsInternal] = React.useState(false);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {}
  }, [links]);

  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    links.forEach((l) => {
      if (l.category) cats.add(l.category);
    });
    return Array.from(cats);
  }, [links]);

  const categoryOptions = React.useMemo(() => {
    const opts = [
      {
        value: "all",
        label: t("all"),
        icon: <Layers className="size-3.5 text-primary" />,
        hint: links.length.toString(),
      },
    ];
    categories.forEach((cat) => {
      const count = links.filter((l) => l.category === cat).length;
      opts.push({
        value: cat,
        label: cat,
        icon: <Folder className="size-3.5 text-muted-foreground" />,
        hint: count.toString(),
      });
    });
    return opts;
  }, [categories, links, t]);

  const filteredLinks = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return links.filter((link) => {
      const matchesQuery =
        !q ||
        link.title.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q) ||
        (link.description && link.description.toLowerCase().includes(q)) ||
        (link.category && link.category.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "all" || link.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [links, searchQuery, selectedCategory]);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    const detectedInternal =
      isInternal || formattedUrl.startsWith("/") || !formattedUrl.includes("://");

    if (!detectedInternal && !formattedUrl.startsWith("http")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const createdLink: CustomLink = {
      id: `link-${Date.now()}`,
      title: newTitle.trim(),
      url: formattedUrl,
      isInternal: detectedInternal,
      category: newCategory.trim() || t("defaultCategory"),
      description: newDescription.trim() || undefined,
      createdAt:
        locale === "fa"
          ? new Intl.DateTimeFormat("fa-IR").format(new Date())
          : new Date().toLocaleDateString(),
    };

    setLinks((prev) => [createdLink, ...prev]);
    setNewTitle("");
    setNewUrl("");
    setNewCategory("");
    setNewDescription("");
    setIsInternal(false);
    setIsAdding(false);
  };

  const handleCopyLink = (link: CustomLink, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = link.isInternal
      ? `${window.location.origin}${link.url}`
      : link.url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLinks((prev) => prev.filter((l) => l.id !== id));
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
            <LinkIcon className="size-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground/90 leading-none truncate">
              {t("title")}
            </h3>
            <span className="text-[11px] text-muted-foreground truncate block">
              {t("subtitle", { count: links.length })}
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
          <span>{isAdding ? t("cancel") : t("newLink")}</span>
        </Button>
      </div>

      {/* ── Add Link Form ── */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddLink}
            className="flex flex-col gap-2.5 p-3 rounded-xl bg-white dark:bg-card border border-border/70 shadow-sm shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                className="h-8.5 text-xs bg-muted/30 border-border/50 flex-1"
                autoFocus
              />
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={t("categoryPlaceholder")}
                className="h-8.5 text-xs bg-muted/30 border-border/50 w-1/3"
              />
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={
                  isInternal
                    ? t("internalPlaceholder")
                    : t("urlPlaceholder")
                }
                dir="ltr"
                className="h-8.5 text-xs bg-muted/30 border-border/50 font-mono text-left"
              />
            </div>

            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder={t("descPlaceholder")}
              className="h-8 text-[11px] bg-muted/30 border-border/50"
            />

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInternal(!isInternal)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1.5",
                    isInternal
                      ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                      : "bg-muted/40 border-border/40 text-muted-foreground"
                  )}
                >
                  <Layers className="size-3" />
                  <span>{t("internalRoute")}</span>
                </button>
              </div>

              <Button
                type="submit"
                size="sm"
                className="h-7 text-xs px-3 shadow-xs"
                disabled={!newTitle.trim() || !newUrl.trim()}
              >
                {t("save")}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── Search & Category Filter (Combobox in front of search) ── */}
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
            options={categoryOptions}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val || "all")}
            placeholder={t("all")}
            size="sm"
            allowClear={false}
            showSearch={categories.length > 5}
            triggerClassName="h-8 text-xs bg-white dark:bg-card border-border/50 shadow-xs"
          />
        </div>
      </div>

      {/* ── Links List ── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pe-1">
        {filteredLinks.length > 0 ? (
          <div
            className={cn(
              "grid gap-2",
              isCompact ? "grid-cols-1" : "grid-cols-1 @[350px]:grid-cols-2 @[680px]:grid-cols-3"
            )}
          >
            {filteredLinks.map((link) => {
              const isCopied = copiedId === link.id;

              const content = (
                <div
                  className={cn(
                    "relative p-3 rounded-xl border border-border/50 bg-white/70 dark:bg-card/60 hover:bg-white dark:hover:bg-card hover:border-border/80 transition-colors duration-150 flex items-center justify-between gap-3 group/link shadow-xs select-none cursor-pointer"
                  )}
                >
                  {/* Left: Icon + Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0 border",
                        link.isInternal
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-sky-500/10 border-sky-500/20 text-sky-500"
                      )}
                    >
                      {link.isInternal ? (
                        <Layers className="size-4" />
                      ) : (
                        <Globe className="size-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs sm:text-sm text-foreground/90 truncate">
                          {link.title}
                        </span>
                        {link.isInternal ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium shrink-0">
                            {t("internal")}
                          </span>
                        ) : (
                          <ArrowUpRight className="size-3 text-muted-foreground shrink-0 opacity-60" />
                        )}
                      </div>

                      {link.description ? (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {link.description}
                        </p>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/70 font-mono truncate block" dir="ltr">
                          {link.url}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Copy & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(link, e)}
                      title={isCopied ? t("copied") : t("copy")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isCopied
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {isCopied ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteLink(link.id, e)}
                      title={t("delete")}
                      className="p-1.5 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover/link:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );

              return link.isInternal ? (
                <Link
                  key={link.id}
                  href={link.url}
                  className="no-underline text-inherit block"
                >
                  {content}
                </Link>
              ) : (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline text-inherit block"
                >
                  {content}
                </a>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
            <LinkIcon className="size-8 mb-2 opacity-25" />
            <p className="text-xs font-medium">{t("empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
