"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatPersonName, formatRoleName } from "@/lib/person-names";
import { 
  Users, 
  Search, 
  X, 
  AlertTriangle, 
  Briefcase, 
  Check, 
  ChevronDown, 
  UserPlus2, 
  UserCheck2,
  Building,
  CreditCard,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "../types/admin.types";

interface SubordinateSelectorProps {
  selectedIds: string[];
  onChange: (newIds: string[]) => void;
  allUsers: User[];
  currentUserId?: string;
  currentEmail?: string;
  isRtl?: boolean;
  disabled?: boolean;
}

export function SubordinateSelector({
  selectedIds = [],
  onChange,
  allUsers = [],
  currentUserId,
  currentEmail,
  isRtl = true,
  disabled = false,
}: SubordinateSelectorProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter out current user (self cannot be subordinate)
  const candidatePool = useMemo(() => {
    return allUsers.filter((u) => {
      if (currentUserId && u.id === currentUserId) return false;
      if (currentEmail && u.email?.toLowerCase() === currentEmail.toLowerCase()) return false;
      return true;
    });
  }, [allUsers, currentUserId, currentEmail]);

  // Selected User Objects (including support for custom/external names)
  const selectedUsers = useMemo(() => {
    return selectedIds.map((id) => {
      const found = allUsers.find((u) => u.id === id || u.employeeId === id || u.email === id || u.name === id);
      if (found) return found;
      return {
        id,
        name: id,
        firstNameFa: id,
        lastNameFa: "",
        employeeId: "",
        jobTitle: "",
        department: "",
      } as unknown as User;
    });
  }, [selectedIds, allUsers]);

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return candidatePool.slice(0, 15);
    }

    return candidatePool.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const faName = `${u.firstNameFa || ""} ${u.lastNameFa || ""}`.toLowerCase();
      const enName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const empId = (u.employeeId || "").toLowerCase();
      const title = (u.jobTitle || "").toLowerCase();
      const dept = (u.department || "").toLowerCase();
      const email = (u.email || "").toLowerCase();

      return (
        name.includes(q) ||
        faName.includes(q) ||
        enName.includes(q) ||
        empId.includes(q) ||
        title.includes(q) ||
        dept.includes(q) ||
        email.includes(q)
      );
    });
  }, [candidatePool, searchQuery]);

  const handleToggleSubordinate = (user: User) => {
    if (disabled) return;
    const isAlreadySelected = selectedIds.includes(user.id);
    if (isAlreadySelected) {
      onChange(selectedIds.filter((id) => id !== user.id));
    } else {
      onChange([...selectedIds, user.id]);
    }
  };

  const handleRemoveSubordinate = (userId: string, e?: React.MouseEvent) => {
    if (disabled) return;
    if (e) {
      e.stopPropagation();
    }
    onChange(selectedIds.filter((id) => id !== userId));
  };

  return (
    <div className="flex flex-col gap-3 w-full" ref={containerRef}>
      {/* Header and Counter */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              {t("directSubordinatesTitle")}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {t("directSubordinatesDesc")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Badge 
              variant="secondary" 
              className="text-[11px] bg-primary/10 text-primary border-primary/20 font-bold fa-num"
            >
              {t("subordinatesCountBadge", { count: selectedIds.length })}
            </Badge>
          )}
          {selectedIds.length > 1 && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md cursor-pointer"
            >
              {isRtl ? "حذف همه" : "Clear all"}
            </Button>
          )}
        </div>
      </div>

      {/* Search & Selector Input Box */}
      <div className="relative w-full">
        <div className="relative">
          <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={t("searchSubordinatesPlaceholder")}
            disabled={disabled}
            className="ps-9 pe-9 h-11 bg-background border-border/50 rounded-xl text-xs"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="size-6 absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-md cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="size-6 absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-md cursor-pointer"
            >
              <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
            </button>
          )}
        </div>

        {/* Dropdown Options List */}
        {isOpen && (
          <div className="absolute top-full start-0 end-0 mt-1 z-50 bg-popover/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl max-h-72 overflow-y-auto p-1.5 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                {isRtl ? "هیچ کاربری با این مشخصات یافت نشد." : "No users found matching your search."}
              </div>
            ) : (
              searchResults.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                const faName = `${user.firstNameFa || ""} ${user.lastNameFa || ""}`.trim();
                const displayName = formatPersonName(isRtl ? (faName || user.name) : (user.name || faName), locale);
                const empId = user.employeeId || "---";

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleToggleSubordinate(user)}
                    className={cn(
                      "w-full p-2.5 rounded-xl text-start flex items-center justify-between gap-3 transition-colors cursor-pointer border text-xs",
                      isSelected
                        ? "bg-primary/10 border-primary/30 text-foreground"
                        : "bg-background/40 hover:bg-muted/80 border-transparent text-foreground"
                    )}
                  >
                    {/* User Avatar + Identity Info */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar className="size-9 rounded-full border border-border/50 shrink-0">
                        {user.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
                        <AvatarFallback
                          className="text-white font-bold text-xs"
                          style={{ backgroundColor: user.avatarColor || "#0284c7" }}
                        >
                          {displayName.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-xs truncate">
                            {displayName}
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40 font-semibold fa-num">
                            {empId}
                          </span>
                          {user.jobTitle && (
                            <Badge variant="outline" className="text-[10px] font-normal py-0 px-1.5 bg-primary/5 text-primary border-primary/20 truncate">
                              {user.jobTitle}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                          {user.department && (
                            <span className="flex items-center gap-1">
                              <Building className="size-3 text-muted-foreground/70" />
                              <span className="truncate">{user.department}</span>
                            </span>
                          )}
                          <span className="truncate opacity-80" dir="ltr">{user.email}</span>
                        </div>

                        {/* Current Manager Warning */}
                        {user.manager && user.manager !== "---" && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                            <AlertTriangle className="size-3 shrink-0" />
                            <span>{t("subordinateCurrentlyAssigned", { manager: user.manager })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Icon / Check */}
                    <div className="shrink-0 flex items-center justify-center">
                      {isSelected ? (
                        <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                          <Check className="size-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="size-6 rounded-full border border-border/80 text-muted-foreground flex items-center justify-center hover:bg-muted">
                          <Plus className="size-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Selected Subordinates Showcase (Cards Grid) */}
      <div className="w-full">
        {selectedUsers.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-border/60 bg-muted/20 text-center flex flex-col items-center justify-center gap-1.5 py-6">
            <div className="size-9 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center">
              <Users className="size-4 opacity-60" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              {t("noSubordinatesSelected")}
            </p>
            <p className="text-[11px] text-muted-foreground/80 max-w-md">
              {isRtl
                ? "جهت انتساب کارشناسان تحت امر، از کادر بالا نام یا کد پرسنلی آن‌ها را جستجو و انتخاب کنید."
                : "Search and select direct reports above using their name, employee ID, or title."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {selectedUsers.map((user) => {
              const faName = `${user.firstNameFa || ""} ${user.lastNameFa || ""}`.trim();
              const displayName = formatPersonName(isRtl ? (faName || user.name) : (user.name || faName), locale);
              const empId = user.employeeId || "---";

              return (
                <div
                  key={user.id}
                  className="p-2.5 rounded-xl border border-border/60 bg-card hover:border-primary/40 transition-all flex items-center justify-between gap-2.5 shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Avatar className="size-8 rounded-full border border-border/50 shrink-0">
                      {user.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
                      <AvatarFallback
                        className="text-white font-bold text-xs"
                        style={{ backgroundColor: user.avatarColor || "#0284c7" }}
                      >
                        {displayName.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground text-xs truncate">
                          {displayName}
                        </span>
                        <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-semibold fa-num">
                          {empId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 truncate">
                        <span className="text-primary font-medium truncate">
                          {formatRoleName(user.jobTitle || (isRtl ? "کارشناس" : "Specialist"), locale)}
                        </span>
                        {user.department && (
                          <span className="truncate opacity-75">
                            • {user.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleRemoveSubordinate(user.id, e)}
                      title={t("removeSubordinate")}
                      className="size-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 shrink-0 cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
