"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Copy,
  Check,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { PersonnelItem } from "../types";
import {
  getLocalizedText,
  getLocalizedJobTitle,
  getSingleLocalizedName,
} from "../utils";

interface PersonnelDetailModalProps {
  person: PersonnelItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PersonnelDetailModal({
  person,
  isOpen,
  onClose,
}: PersonnelDetailModalProps) {
  const locale = useLocale();
  const isFa = locale === "fa";
  const t = useTranslations("Directory");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!person) return null;

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

  const primaryEmail = person.esp.email || person.npc.email || "";
  const localizedLocation = getLocalizedText(
    person.contact.workLocation,
    locale
  );
  const localizedFloor = getLocalizedText(person.contact.floor, locale);

  // ESP details
  const espJobTitle = getLocalizedJobTitle(person.esp, locale);
  const espAltTitle = isFa ? person.esp.jobTitleEn : person.esp.jobTitleFa;
  const espDept = getLocalizedText(person.esp.department, locale);

  // NPC details
  const npcJobTitle = getLocalizedJobTitle(person.npc, locale);
  const npcAltTitle = isFa ? person.npc.jobTitleEn : person.npc.jobTitleFa;
  const npcDept = getLocalizedText(person.npc.department, locale);

  // Education details
  const localizedDegree = getLocalizedText(person.education.degree, locale);

  // Gradient ring based on company
  const ringGradient = person.isDual
    ? "from-purple-600 via-sky-500 to-emerald-500"
    : person.isNpcOnly
    ? "from-emerald-600 via-teal-400 to-emerald-700"
    : "from-sky-600 via-blue-500 to-indigo-600";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border border-border/60 bg-background/95 backdrop-blur-2xl shadow-2xl flex flex-col font-sans">
        <DialogTitle className="sr-only">{displayName}</DialogTitle>

        {/* Top Hero Banner */}
        <div
          className={`h-28 sm:h-36 w-full relative shrink-0 overflow-hidden ${
            person.isDual
              ? "bg-gradient-to-r from-purple-800 via-indigo-700 to-sky-700"
              : person.isNpcOnly
              ? "bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800"
              : "bg-gradient-to-r from-blue-800 via-sky-700 to-cyan-700"
          }`}
        >
          <div className="absolute top-0 end-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 w-80 h-80 bg-black/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Centered Profile Avatar & Identity Header (Profile Manager Style with Ring) */}
        <div className="relative mx-auto -mt-16 sm:-mt-20 z-10 flex flex-col items-center px-6 shrink-0">
          {/* Outer Gradient Ring Wrapper */}
          <div
            className={`relative p-1 rounded-full bg-gradient-to-tr ${ringGradient} shadow-2xl ring-4 ring-background`}
          >
            <Avatar className="size-28 sm:size-32 rounded-full border-2 border-background shadow-inner">
              {person.avatar ? (
                <AvatarImage
                  src={person.avatar}
                  alt={displayName}
                  className="object-cover size-full rounded-full"
                />
              ) : null}
              <AvatarFallback
                className="text-4xl sm:text-5xl font-bold text-white rounded-full"
                style={{ backgroundColor: person.avatarColor || "#0284c7" }}
              >
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Centered Name (Single Language Only) */}
          <div className="mt-3.5 text-center space-y-1.5 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {displayName}
            </h2>

            {/* Company Membership Badge (No System Role Badges) */}
            <div className="flex items-center justify-center gap-2 pt-0.5">
              {person.isDual ? (
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3.5 py-1 font-medium shadow-sm rounded-full">
                  {t("modal.dualBadge")}
                </Badge>
              ) : person.isNpcOnly ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-1 font-medium shadow-sm rounded-full">
                  {t("card.npcBadge")}
                </Badge>
              ) : (
                <Badge className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3.5 py-1 font-medium shadow-sm rounded-full">
                  {t("card.espBadge")}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 pt-5 flex-1">
          {/* Quick Contact & Extension Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs">
            {/* Extension */}
            <div className="flex items-center justify-between gap-2.5 p-1">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-[11px]">
                    {t("modal.extension")}
                  </p>
                  <p className="font-bold text-sm text-primary">
                    {person.contact.extension || t("modal.none")}
                  </p>
                </div>
              </div>
              {person.contact.extension && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 rounded-full"
                  onClick={() =>
                    copyToClipboard(
                      person.contact.extension,
                      t("modal.extension")
                    )
                  }
                  title={t("modal.extension")}
                >
                  {copiedField === t("modal.extension") ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
            </div>

            {/* Corporate Email */}
            <div className="flex items-center justify-between gap-2.5 p-1 sm:border-s sm:ps-3.5 border-border/50">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[11px]">
                    {t("modal.email")}
                  </p>
                  {primaryEmail ? (
                    <a
                      href={`mailto:${primaryEmail}`}
                      className="text-xs text-foreground truncate block hover:underline dir-ltr text-start"
                      title={primaryEmail}
                    >
                      {primaryEmail}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t("modal.none")}
                    </span>
                  )}
                </div>
              </div>
              {primaryEmail && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 rounded-full"
                  onClick={() =>
                    copyToClipboard(primaryEmail, t("modal.email"))
                  }
                  title={t("modal.email")}
                >
                  {copiedField === t("modal.email") ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
            </div>

            {/* Work Location */}
            <div className="flex items-center gap-3 p-1 sm:border-s sm:ps-3.5 border-border/50 col-span-1 sm:col-span-2 md:col-span-1">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[11px]">
                  {t("modal.location")}
                </p>
                <p className="text-xs text-foreground font-medium truncate">
                  {localizedLocation || t("modal.none")}
                  {localizedFloor ? ` (${localizedFloor})` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Company Roles Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>{t("modal.groupRoles")}</span>
            </h3>

            {/* Euroslot Pars Role Card */}
            {person.esp.hasRole && (
              <div className="rounded-2xl border border-sky-500/25 bg-sky-500/[0.03] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-sky-500/20">
                  <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-sm">
                    <Building2 className="w-4 h-4" />
                    <span>{t("modal.espTitle")}</span>
                  </div>
                  {person.esp.personnelCode && (
                    <Badge variant="secondary" className="text-xs rounded-lg">
                      {t("modal.personnelCode")} {person.esp.personnelCode}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                  <div>
                    <span className="text-muted-foreground">
                      {t("modal.jobTitle")}
                    </span>{" "}
                    <span className="font-bold text-foreground">
                      {espJobTitle || t("modal.none")}
                    </span>
                    {espAltTitle && espAltTitle !== espJobTitle && (
                      <span className="text-muted-foreground block text-[11px] mt-0.5 font-sans">
                        {espAltTitle}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-muted-foreground">
                      {t("modal.department")}
                    </span>{" "}
                    <span className="font-bold text-foreground">
                      {espDept || t("modal.none")}
                    </span>
                  </div>

                  {person.esp.manager && (
                    <div>
                      <span className="text-muted-foreground">
                        {t("modal.manager")}
                      </span>{" "}
                      <span className="font-medium text-foreground">
                        {person.esp.manager}
                      </span>
                    </div>
                  )}

                  {person.esp.email && (
                    <div>
                      <span className="text-muted-foreground">
                        {t("modal.dedicatedEmail")}
                      </span>{" "}
                      <a
                        href={`mailto:${person.esp.email}`}
                        className="text-primary hover:underline dir-ltr inline-block text-start"
                      >
                        {person.esp.email}
                      </a>
                    </div>
                  )}
                </div>

                {person.esp.duties && (
                  <div className="pt-3 border-t border-sky-500/20 text-xs space-y-1.5">
                    <span className="text-muted-foreground font-semibold block">
                      {t("modal.duties")}
                    </span>
                    <p className="text-foreground/90 leading-relaxed bg-background/60 p-3 rounded-xl border border-sky-500/15 whitespace-pre-line text-xs">
                      {person.esp.duties}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Nano Palayesh Ceram Role Card */}
            {person.npc.hasRole && (
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.03] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    <Building2 className="w-4 h-4" />
                    <span>{t("modal.npcTitle")}</span>
                  </div>
                  {person.npc.personnelCode && (
                    <Badge variant="secondary" className="text-xs rounded-lg">
                      {t("modal.personnelCode")} {person.npc.personnelCode}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                  <div>
                    <span className="text-muted-foreground">
                      {t("modal.jobTitle")}
                    </span>{" "}
                    <span className="font-bold text-foreground">
                      {npcJobTitle || t("modal.none")}
                    </span>
                    {npcAltTitle && npcAltTitle !== npcJobTitle && (
                      <span className="text-muted-foreground block text-[11px] mt-0.5 font-sans">
                        {npcAltTitle}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-muted-foreground">
                      {t("modal.department")}
                    </span>{" "}
                    <span className="font-bold text-foreground">
                      {npcDept || t("modal.none")}
                    </span>
                  </div>

                  {person.npc.manager && (
                    <div>
                      <span className="text-muted-foreground">
                        {t("modal.manager")}
                      </span>{" "}
                      <span className="font-medium text-foreground">
                        {person.npc.manager}
                      </span>
                    </div>
                  )}

                  {person.npc.email && (
                    <div>
                      <span className="text-muted-foreground">
                        {t("modal.dedicatedEmail")}
                      </span>{" "}
                      <a
                        href={`mailto:${person.npc.email}`}
                        className="text-primary hover:underline dir-ltr inline-block text-start"
                      >
                        {person.npc.email}
                      </a>
                    </div>
                  )}
                </div>

                {person.npc.duties && (
                  <div className="pt-3 border-t border-emerald-500/20 text-xs space-y-1.5">
                    <span className="text-muted-foreground font-semibold block">
                      {t("modal.duties")}
                    </span>
                    <p className="text-foreground/90 leading-relaxed bg-background/60 p-3 rounded-xl border border-emerald-500/15 whitespace-pre-line text-xs">
                      {person.npc.duties}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Education Info */}
          {(person.education.degree || person.education.university) && (
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-4.5 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>{t("modal.educationTitle")}</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                {person.education.degree && (
                  <span>
                    <strong className="text-foreground">
                      {t("modal.degree")}
                    </strong>{" "}
                    {localizedDegree}
                  </span>
                )}
                {person.education.fieldOfStudy && (
                  <span>
                    <strong className="text-foreground">
                      {t("modal.field")}
                    </strong>{" "}
                    {person.education.fieldOfStudy}
                  </span>
                )}
                {person.education.university && (
                  <span>
                    <strong className="text-foreground">
                      {t("modal.university")}
                    </strong>{" "}
                    {person.education.university}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs px-5 h-9"
            >
              {t("modal.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
