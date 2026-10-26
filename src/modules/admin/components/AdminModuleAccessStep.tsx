"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { NAVIGATION, NavColor, NAV_COLOR_MAP } from "@/config/navigation";
import { UserModuleAccess } from "../types/admin.types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  KeyRound, 
  Search, 
  CheckSquare, 
  Square, 
  X, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FolderLock
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminModuleAccessStepProps {
  modulesAccess?: UserModuleAccess[];
  onChange: (updated: UserModuleAccess[]) => void;
  availableModules?: any[];
  readOnly?: boolean;
}

export function AdminModuleAccessStep({
  modulesAccess = [],
  onChange,
  availableModules,
  readOnly = false,
}: AdminModuleAccessStepProps) {
  const t = useTranslations("Admin");
  const tMenu = useTranslations("Menu");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [searchQuery, setSearchQuery] = useState("");

  // Filter out main and dashboard if not already filtered
  const navGroups = useMemo(() => {
    const source = availableModules || NAVIGATION;
    return source.filter((g) => g.id !== "main" && g.id !== "dashboard");
  }, [availableModules]);

  // Fast access map for O(1) lookups
  const accessMap = useMemo(() => {
    const map = new Map<string, boolean>();
    (modulesAccess || []).forEach((m) => {
      map.set(m.moduleId, m.hasAccess);
    });
    return map;
  }, [modulesAccess]);

  // Collect all valid target IDs (both group and items)
  const allTargetIds = useMemo(() => {
    const ids: { id: string; isGroup: boolean; parentId?: string }[] = [];
    navGroups.forEach((g) => {
      ids.push({ id: g.id, isGroup: true });
      if (g.items && g.items.length > 0) {
        g.items.forEach((item: any) => {
          ids.push({ id: item.href, isGroup: false, parentId: g.id });
        });
      }
    });
    return ids;
  }, [navGroups]);

  // Total count of distinct sub-items or standalone groups
  const totalItemCount = useMemo(() => {
    let count = 0;
    navGroups.forEach((g) => {
      if (g.items && g.items.length > 0) {
        count += g.items.length;
      } else {
        count += 1;
      }
    });
    return count;
  }, [navGroups]);

  // Count active items
  const activeItemCount = useMemo(() => {
    let count = 0;
    navGroups.forEach((g) => {
      if (g.items && g.items.length > 0) {
        g.items.forEach((item: any) => {
          if (accessMap.get(item.href)) count++;
        });
      } else {
        if (accessMap.get(g.id)) count++;
      }
    });
    return count;
  }, [navGroups, accessMap]);

  // Helper to translate group title safely
  const getGroupTitle = (labelKey: string): string => {
    try {
      const val = tMenu(`sections.${labelKey}` as any);
      return val && !val.includes("sections.") ? val : labelKey;
    } catch {
      return labelKey;
    }
  };

  // Helper to translate item title safely
  const getItemTitle = (labelKey: string): string => {
    try {
      const val = tMenu(`items.${labelKey}` as any);
      return val && !val.includes("items.") ? val : labelKey;
    } catch {
      return labelKey;
    }
  };

  // Toggle single item
  const handleToggleItem = (itemId: string, checked: boolean, parentGroupId?: string) => {
    if (readOnly) return;
    const current = [...(modulesAccess || [])];
    const existingIndex = current.findIndex((m) => m.moduleId === itemId);

    if (existingIndex >= 0) {
      current[existingIndex] = {
        ...current[existingIndex],
        hasAccess: checked,
      };
    } else {
      current.push({
        moduleId: itemId,
        hasAccess: checked,
        accessLevel: "read",
        usagePercentage: 0,
        hoursSpent: "00:00:00",
      });
    }

    // If item was enabled and has a parent group, also ensure parent group has access flag enabled
    if (checked && parentGroupId) {
      const parentIdx = current.findIndex((m) => m.moduleId === parentGroupId);
      if (parentIdx >= 0) {
        current[parentIdx] = { ...current[parentIdx], hasAccess: true };
      } else {
        current.push({
          moduleId: parentGroupId,
          hasAccess: true,
          accessLevel: "read",
          usagePercentage: 0,
          hoursSpent: "00:00:00",
        });
      }
    }

    onChange(current);
  };

  // Toggle entire group
  const handleToggleGroup = (groupId: string, checked: boolean) => {
    if (readOnly) return;
    const group = navGroups.find((g) => g.id === groupId);
    if (!group) return;

    const idsToUpdate = new Set<string>();
    idsToUpdate.add(group.id);
    (group.items || []).forEach((item: any) => {
      idsToUpdate.add(item.href);
    });

    const current = [...(modulesAccess || [])];

    idsToUpdate.forEach((id) => {
      const existingIndex = current.findIndex((m) => m.moduleId === id);
      if (existingIndex >= 0) {
        current[existingIndex] = {
          ...current[existingIndex],
          hasAccess: checked,
        };
      } else {
        current.push({
          moduleId: id,
          hasAccess: checked,
          accessLevel: "read",
          usagePercentage: 0,
          hoursSpent: "00:00:00",
        });
      }
    });

    onChange(current);
  };

  // Select all modules
  const handleSelectAll = () => {
    if (readOnly) return;
    const current = [...(modulesAccess || [])];

    allTargetIds.forEach(({ id }) => {
      const existingIndex = current.findIndex((m) => m.moduleId === id);
      if (existingIndex >= 0) {
        current[existingIndex] = {
          ...current[existingIndex],
          hasAccess: true,
        };
      } else {
        current.push({
          moduleId: id,
          hasAccess: true,
          accessLevel: "read",
          usagePercentage: 0,
          hoursSpent: "00:00:00",
        });
      }
    });

    onChange(current);
  };

  // Deselect all modules
  const handleDeselectAll = () => {
    if (readOnly) return;
    const current = (modulesAccess || []).map((m) => ({
      ...m,
      hasAccess: false,
    }));
    onChange(current);
  };

  // Filter groups and items based on search query
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return navGroups;

    return navGroups
      .map((g) => {
        const groupTitle = getGroupTitle(g.labelKey).toLowerCase();
        const groupMatches = groupTitle.includes(q) || g.id.toLowerCase().includes(q);

        const matchingItems = (g.items || []).filter((item: any) => {
          const itemTitle = getItemTitle(item.labelKey).toLowerCase();
          return itemTitle.includes(q) || item.href.toLowerCase().includes(q);
        });

        if (groupMatches) {
          return g; // keep all items if group title matches
        }

        if (matchingItems.length > 0) {
          return {
            ...g,
            items: matchingItems,
          };
        }

        return null;
      })
      .filter(Boolean) as typeof navGroups;
  }, [navGroups, searchQuery, tMenu]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-background/70 dark:bg-slate-900/40 border border-border/40 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
            <KeyRound className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-foreground">
                {t("segmentModules")}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 fa-num">
                {t("selectedModulesCount", { count: activeItemCount, total: totalItemCount })}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t("moduleAccessStepPrompt")}
            </p>
          </div>
        </div>

        {/* Global Select All / Clear Buttons */}
        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 px-2.5 rounded-xl text-xs font-medium border-border/60 hover:bg-primary/10 hover:text-primary gap-1.5 cursor-pointer transition-colors"
            >
              <CheckSquare className="size-3.5" />
              <span>{t("selectAllModules")}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
              className="h-8 px-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 gap-1.5 cursor-pointer transition-colors"
            >
              <Square className="size-3.5" />
              <span>{t("deselectAllModules")}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("searchModulesPlaceholder")}
          className="h-10 ps-9 pe-9 bg-background/70 border-border/50 rounded-xl text-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Modules Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="p-8 text-center bg-background/50 rounded-2xl border border-border/40 space-y-2">
          <FolderLock className="size-8 text-muted-foreground/40 mx-auto" />
          <p className="text-xs font-medium text-muted-foreground">
            {t("noModulesFound")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredGroups.map((group) => {
            const GroupIcon = group.icon;
            const groupTitle = getGroupTitle(group.labelKey);
            const items = group.items || [];
            
            // Calculate active items in this group
            let groupActiveCount = 0;
            if (items.length > 0) {
              items.forEach((it: any) => {
                if (accessMap.get(it.href)) groupActiveCount++;
              });
            } else {
              if (accessMap.get(group.id)) groupActiveCount = 1;
            }

            const totalInGroup = items.length > 0 ? items.length : 1;
            const isGroupFullyActive = groupActiveCount === totalInGroup;
            const isGroupPartiallyActive = groupActiveCount > 0 && !isGroupFullyActive;

            // Color token mapping
            const colorToken = (group.color as NavColor) || "slate";
            const colorStyle = NAV_COLOR_MAP[colorToken] || NAV_COLOR_MAP.slate;

            return (
              <div
                key={group.id}
                className={cn(
                  "flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden bg-background/70 dark:bg-slate-900/40",
                  groupActiveCount > 0
                    ? "border-primary/30 shadow-2xs"
                    : "border-border/40 hover:border-border/70"
                )}
              >
                {/* Group Header */}
                <div className="flex items-center justify-between p-3 sm:p-3.5 bg-muted/30 border-b border-border/30 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center shrink-0 border border-border/40",
                        colorStyle.iconBg || "bg-primary/10 text-primary"
                      )}
                    >
                      {GroupIcon && <GroupIcon size={18} weight="duotone" className={colorStyle.icon} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">
                        {groupTitle}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium fa-num">
                        {groupActiveCount} / {totalInGroup} {t("moduleActiveBadge")}
                      </span>
                    </div>
                  </div>

                  {/* Group Master Switch */}
                  {!readOnly && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-muted-foreground hidden sm:inline-block font-medium">
                        {t("moduleGroupSelectAll")}
                      </span>
                      <Switch
                        size="sm"
                        checked={isGroupFullyActive}
                        onCheckedChange={(checked) => handleToggleGroup(group.id, checked)}
                        className={cn(
                          isGroupPartiallyActive && !isGroupFullyActive && "opacity-80 ring-1 ring-primary/40"
                        )}
                        aria-label={`Toggle all ${groupTitle}`}
                      />
                    </div>
                  )}
                </div>

                {/* Sub-Items List */}
                <div className="p-2 sm:p-2.5 flex flex-col gap-1.5 divide-y divide-border/20">
                  {items.length === 0 ? (
                    // Standalone group without sub-items
                    <div className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-muted/40 transition-colors">
                      <span className="text-xs font-semibold text-foreground">
                        {groupTitle}
                      </span>
                      <Switch
                        size="sm"
                        checked={Boolean(accessMap.get(group.id))}
                        onCheckedChange={(checked) => handleToggleItem(group.id, checked)}
                        disabled={readOnly}
                      />
                    </div>
                  ) : (
                    items.map((item: any) => {
                      const ItemIcon = item.icon;
                      const itemTitle = getItemTitle(item.labelKey);
                      const hasAccess = Boolean(accessMap.get(item.href));

                      return (
                        <div
                          key={item.href}
                          className={cn(
                            "flex items-center justify-between py-1.5 px-2.5 rounded-xl transition-colors gap-2 pt-2",
                            hasAccess
                              ? "bg-primary/5 hover:bg-primary/10"
                              : "hover:bg-muted/30"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="size-5 rounded-md flex items-center justify-center shrink-0 text-muted-foreground">
                              {ItemIcon ? (
                                <ItemIcon size={14} weight="duotone" className={hasAccess ? "text-primary" : "opacity-60"} />
                              ) : (
                                <ShieldCheck size={14} className={hasAccess ? "text-primary" : "opacity-60"} />
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-xs font-medium truncate",
                                hasAccess ? "text-foreground font-semibold" : "text-muted-foreground"
                              )}
                            >
                              {itemTitle}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={cn(
                                "text-[9.5px] px-1.5 py-0.2 rounded font-semibold",
                                hasAccess
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "text-muted-foreground/60"
                              )}
                            >
                              {hasAccess ? t("moduleActiveBadge") : t("moduleInactiveBadge")}
                            </span>
                            <Switch
                              size="sm"
                              checked={hasAccess}
                              onCheckedChange={(checked) =>
                                handleToggleItem(item.href, checked, group.id)
                              }
                              disabled={readOnly}
                              aria-label={`Toggle access for ${itemTitle}`}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
