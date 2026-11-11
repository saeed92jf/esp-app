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
  ShieldCheck,
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
  getLocalizedName,
} from "../utils";

interface PersonnelCardProps {
  person: PersonnelItem;
  onOpenDetails: (person: PersonnelItem) => void;
}

export function PersonnelCard({ person, onOpenDetails }: PersonnelCardProps) {
  const locale = useLocale();
  const t = useTranslations("Directory");
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const { primary: primaryName, secondary: secondaryName } = getLocalizedName(
    person,
    locale
  );

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

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-card/70 hover:bg-card/95 backdrop-blur-md shadow-sm hover:shadow-xl hover:-translate-y-1",
        person.isDual
          ? "border-purple-500/25 hover:border-purple-500/50 bg-gradient-to-b from-purple-500/[0.03] to-transparent"
          : person.isNpcOnly
          ? "border-emerald-500/25 hover:border-emerald-500/50 bg-gradient-to-b from-emerald-500/[0.03] to-transparent"
          : "border-sky-500/25 hover:border-sky-500/50 bg-gradient-to-b from-sky-500/[0.03] to-transparent"
      )}
    >
      {/* Top Banner Accent */}
      <div
        className={cn(
          "h-1.5 w-full",
          person.isDual
            ? "bg-gradient-to-r from-purple-600 via-sky-500 to-emerald-500"
            : person.isNpcOnly
            ? "bg-gradient-to-r from-emerald-500 to-teal-600"
            : "bg-gradient-to-r from-sky-500 to-blue-600"
        )}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Card Header: Company Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {person.isDual ? (
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 text-xs px-2.5 py-0.5 font-medium flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              {t("card.dualBadge")}
            </Badge>
          ) : person.isNpcOnly ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5 font-medium flex items-center gap-1"
            >
              <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {t("card.npcBadge")}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 text-xs px-2.5 py-0.5 font-medium flex items-center gap-1"
            >
              <Building2 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              {t("card.espBadge")}
            </Badge>
          )}

          {person.role === "superadmin" || person.role === "admin" ? (
            <Badge
              variant="secondary"
              className="text-[11px] font-normal bg-muted text-muted-foreground"
            >
              <ShieldCheck className="w-3 h-3 text-amber-500 me-1 inline" />
              {person.role === "superadmin"
                ? t("card.superadmin")
                : t("card.admin")}
            </Badge>
          ) : (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t("card.activeStaff")}
            </span>
          )}
        </div>

        {/* User Identity: Avatar & Name */}
        <div className="flex items-start gap-3.5 mb-4">
          <Avatar className="h-14 w-14 rounded-2xl ring-2 ring-primary/20 shadow-md shrink-0">
            {person.avatar ? (
              <AvatarImage
                src={person.avatar}
                alt={primaryName}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback
              className="rounded-2xl font-bold text-white text-base"
              style={{ backgroundColor: person.avatarColor || "#0284c7" }}
            >
              {getInitials(person.fullNameEn || person.fullNameFa)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
              {primaryName}
            </h3>
            {secondaryName ? (
              <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                {secondaryName}
              </p>
            ) : null}

            {/* Department Tag */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {espDept && (
                <span className="inline-flex items-center text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md font-medium">
                  {espDept}
                </span>
              )}
              {person.isDual && npcDept && (
                <span className="inline-flex items-center text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md font-medium">
                  {npcDept}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Job Titles Block */}
        <div className="rounded-xl bg-muted/40 p-3 mb-4 space-y-1.5 border border-border/40">
          {person.isDual ? (
            <>
              <div className="flex items-start gap-1.5 text-xs">
                <span className="font-semibold text-sky-600 dark:text-sky-400 shrink-0">
                  ESP:
                </span>
                <span className="text-foreground truncate font-medium">
                  {espTitle || t("card.none")}
                </span>
              </div>
              <div className="flex items-start gap-1.5 text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  NPC:
                </span>
                <span className="text-foreground truncate font-medium">
                  {npcTitle || t("card.none")}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-foreground font-medium truncate">
                {person.isNpcOnly
                  ? npcTitle || t("card.none")
                  : espTitle || t("card.none")}
              </span>
            </div>
          )}
        </div>

        {/* Contact Strip */}
        <div className="space-y-2 text-xs mb-4">
          {/* Internal Extension */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-primary/[0.04] border border-primary/10">
            <div className="flex items-center gap-2 text-foreground font-medium min-w-0">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{t("card.extensionLabel")}</span>
              <span className="font-bold text-sm text-primary font-mono shrink-0">
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
          {primaryEmail && (
            <div className="flex items-center justify-between gap-2 text-muted-foreground hover:text-foreground transition-colors px-1">
              <a
                href={`mailto:${primaryEmail}`}
                className="flex items-center gap-2 truncate dir-ltr text-start hover:underline"
                title={primaryEmail}
              >
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate font-mono text-[11px]">
                  {primaryEmail}
                </span>
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() =>
                  copyToClipboard(primaryEmail, t("card.corporateEmail"))
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
      </div>

      {/* Card Footer Button */}
      <div className="p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs font-medium rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
          onClick={() => onOpenDetails(person)}
        >
          <span>{t("card.viewProfile")}</span>
          <ExternalLink className="w-3 h-3 ms-1.5" />
        </Button>
      </div>
    </div>
  );
}
