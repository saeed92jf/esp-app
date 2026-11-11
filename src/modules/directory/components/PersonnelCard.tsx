"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Building2,
  Copy,
  Check,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { PersonnelItem } from "../types";
import {
  getLocalizedText,
  getLocalizedJobTitle,
  getSingleLocalizedName,
} from "../utils";

interface PersonnelCardProps {
  person: PersonnelItem;
  onOpenDetails: (person: PersonnelItem) => void;
}

export function PersonnelCard({ person, onOpenDetails }: PersonnelCardProps) {
  const locale = useLocale();
  const t = useTranslations("Directory");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [roleIndex, setRoleIndex] = useState<0 | 1>(0);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} ${t("card.copied")}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getInitials = (name: string) => {
    if (!name) return "EP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Strictly single language name (FA in fa, EN in en)
  const displayName = getSingleLocalizedName(person, locale);

  const isDual = Boolean(person.isDual);
  const primaryEmail = person.esp.email || person.npc.email || "";

  // Localized values
  const espDept = getLocalizedText(person.esp.department, locale);
  const npcDept = getLocalizedText(person.npc.department, locale);
  const espTitle = getLocalizedJobTitle(person.esp, locale);
  const npcTitle = getLocalizedJobTitle(person.npc, locale);
  const localizedLocation = getLocalizedText(
    person.contact.workLocation,
    locale
  );
  const localizedFloor = getLocalizedText(person.contact.floor, locale);

  // Active role-specific values for multi-role employees
  const activeDept = isDual
    ? roleIndex === 0
      ? espDept
      : npcDept
    : person.isNpcOnly
    ? npcDept
    : espDept;

  const activeTitle = isDual
    ? roleIndex === 0
      ? espTitle
      : npcTitle
    : person.isNpcOnly
    ? npcTitle
    : espTitle;

  const activeEmail = isDual
    ? roleIndex === 0
      ? person.esp.email || primaryEmail
      : person.npc.email || primaryEmail
    : primaryEmail;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 font-sans",
        "bg-white dark:bg-card shadow-xs hover:shadow-xl hover:-translate-y-1",
        isDual
          ? roleIndex === 0
            ? "border-sky-500/25 hover:border-sky-500/50"
            : "border-emerald-500/25 hover:border-emerald-500/50"
          : person.isNpcOnly
          ? "border-emerald-500/25 hover:border-emerald-500/50"
          : "border-sky-500/25 hover:border-sky-500/50"
      )}
    >
      {/* Top Banner Accent */}
      <div
        className={cn(
          "h-1.5 w-full transition-all duration-500",
          isDual
            ? roleIndex === 0
              ? "bg-gradient-to-r from-sky-500 to-blue-600"
              : "bg-gradient-to-r from-emerald-500 to-teal-600"
            : person.isNpcOnly
            ? "bg-gradient-to-r from-emerald-500 to-teal-600"
            : "bg-gradient-to-r from-sky-500 to-blue-600"
        )}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Card Header: Company Badge ONLY */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {isDual ? (
            <button
              type="button"
              onClick={() => setRoleIndex(roleIndex === 0 ? 1 : 0)}
              className={cn(
                "rounded-full text-xs px-2.5 py-0.5 font-medium flex items-center gap-1.5 transition-all duration-300 border cursor-pointer",
                roleIndex === 0
                  ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 hover:bg-sky-500/20"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
              )}
              title={t("card.dualBadge")}
            >
              <Building2
                className={cn(
                  "w-3 h-3 transition-colors",
                  roleIndex === 0
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              />
              <span>
                {roleIndex === 0 ? t("card.espBadge") : t("card.npcBadge")}
              </span>
              <span className="text-[10px] opacity-75 font-mono">
                ({roleIndex + 1}/2)
              </span>
            </button>
          ) : person.isNpcOnly ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5 font-medium flex items-center gap-1.5"
            >
              <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {t("card.npcBadge")}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 text-xs px-2.5 py-0.5 font-medium flex items-center gap-1.5"
            >
              <Building2 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              {t("card.espBadge")}
            </Badge>
          )}

          {person.contact.extension ? (
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Phone className="w-3 h-3 text-primary" />
              <span>{person.contact.extension}</span>
            </span>
          ) : null}
        </div>

        {/* User Identity: Circular Avatar & Single Language Name */}
        <div className="flex items-center gap-3.5 mb-4">
          <Avatar className="h-14 w-14 rounded-full ring-2 ring-primary/20 shadow-md shrink-0">
            {person.avatar ? (
              <AvatarImage
                src={person.avatar}
                alt={displayName}
                className="object-cover size-full rounded-full"
              />
            ) : null}
            <AvatarFallback
              className="rounded-full font-bold text-white text-base"
              style={{ backgroundColor: person.avatarColor || "#0284c7" }}
            >
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
              {displayName}
            </h3>

            {/* Department Tag */}
            <div className="mt-1 flex flex-wrap gap-1">
              {activeDept && (
                <span
                  className={cn(
                    "inline-flex items-center text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors duration-300",
                    isDual
                      ? roleIndex === 0
                        ? "text-sky-700 dark:text-sky-300 bg-sky-500/10"
                        : "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                      : "text-muted-foreground bg-muted/60"
                  )}
                >
                  {activeDept}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Job Titles Block with smooth transition */}
        <div className="rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/40 p-3 mb-4 space-y-1.5 text-xs transition-all duration-300">
          <div className="flex items-center gap-2">
            <Briefcase
              className={cn(
                "w-3.5 h-3.5 shrink-0 transition-colors",
                isDual
                  ? roleIndex === 0
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              )}
            />
            <span className="text-foreground font-semibold truncate">
              {activeTitle || t("card.none")}
            </span>
          </div>

          {isDual && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
              <span className="font-medium">
                {roleIndex === 0 ? t("card.espBadge") : t("card.npcBadge")}
              </span>
              <span className="font-mono text-[10px] opacity-75">
                {t("pagination.pageOf", { current: roleIndex + 1, total: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Contact Strip */}
        <div className="space-y-2 text-xs mb-3">
          {/* Internal Extension */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-sky-50 dark:bg-primary/[0.06] border border-sky-100 dark:border-primary/15">
            <div className="flex items-center gap-2 text-foreground font-medium min-w-0">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{t("card.extensionLabel")}</span>
              <span className="font-bold text-sm text-primary shrink-0">
                {person.contact.extension || t("card.none")}
              </span>
            </div>
            {person.contact.extension && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() =>
                  copyToClipboard(person.contact.extension, t("card.extension"))
                }
                title={t("card.extension")}
              >
                {copiedField === t("card.extension") ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>

          {/* Email */}
          {activeEmail && (
            <div className="flex items-center justify-between gap-2 text-muted-foreground hover:text-foreground transition-colors px-1">
              <a
                href={`mailto:${activeEmail}`}
                className="flex items-center gap-2 truncate dir-ltr text-start hover:underline"
                title={activeEmail}
              >
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate text-[11px]">{activeEmail}</span>
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() =>
                  copyToClipboard(activeEmail, t("card.corporateEmail"))
                }
                title={t("card.corporateEmail")}
              >
                {copiedField === t("card.corporateEmail") ? (
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <Copy className="w-2.5 h-2.5" />
                )}
              </Button>
            </div>
          )}

          {/* Location */}
          {localizedLocation && (
            <div className="flex items-center gap-2 text-muted-foreground px-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate text-[11px]">
                {localizedLocation}{" "}
                {localizedFloor ? `(${localizedFloor})` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Dual Role Pagination Dots */}
        {isDual && (
          <div className="flex items-center justify-center gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={() => setRoleIndex(0)}
              className={cn(
                "transition-all duration-300 rounded-full focus:outline-none cursor-pointer",
                roleIndex === 0
                  ? "w-6 h-2 bg-sky-500 shadow-xs"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              )}
              title={t("pagination.espRole")}
              aria-label={t("pagination.espRole")}
            />
            <button
              type="button"
              onClick={() => setRoleIndex(1)}
              className={cn(
                "transition-all duration-300 rounded-full focus:outline-none cursor-pointer",
                roleIndex === 1
                  ? "w-6 h-2 bg-emerald-500 shadow-xs"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              )}
              title={t("pagination.npcRole")}
              aria-label={t("pagination.npcRole")}
            />
          </div>
        )}
      </div>

      {/* Card Footer Button */}
      <div className="p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs font-medium rounded-xl bg-slate-50/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
          onClick={() => onOpenDetails(person)}
        >
          <span>{t("card.viewProfile")}</span>
          <ExternalLink className="w-3 h-3 ms-1.5" />
        </Button>
      </div>
    </div>
  );
}
