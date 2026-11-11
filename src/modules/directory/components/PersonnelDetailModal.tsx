"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  User,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from "lucide-react";
import type { PersonnelItem } from "../types";

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
  if (!person) return null;

  const getInitials = (name: string) => {
    if (!name) return "EP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border border-border/60 bg-background/95 backdrop-blur-xl">
        {/* Header Hero Banner */}
        <div
          className={`h-24 w-full relative ${
            person.isDual
              ? "bg-gradient-to-r from-purple-700 via-indigo-600 to-sky-600"
              : person.isNpcOnly
              ? "bg-gradient-to-r from-emerald-600 to-teal-700"
              : "bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-600"
          }`}
        >
          <div className="absolute -bottom-10 right-6">
            <Avatar className="h-20 w-20 rounded-2xl ring-4 ring-background shadow-xl">
              {person.avatar ? (
                <AvatarImage src={person.avatar} alt={person.fullNameFa} />
              ) : null}
              <AvatarFallback
                className="rounded-2xl font-bold text-white text-xl"
                style={{ backgroundColor: person.avatarColor || "#0284c7" }}
              >
                {getInitials(person.fullNameEn || person.fullNameFa)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Content Body */}
        <div className="pt-12 p-6 space-y-6">
          {/* Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {person.fullNameFa}
              </h2>
              <p className="text-sm text-muted-foreground font-mono mt-0.5 dir-ltr text-right">
                {person.fullNameEn}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {person.isDual ? (
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1">
                  عضویت هر دو شرکت (مشترک)
                </Badge>
              ) : person.isNpcOnly ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1">
                  نانو پالایش سرام
                </Badge>
              ) : (
                <Badge className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 py-1">
                  یورواسلات پارس
                </Badge>
              )}

              {person.role === "superadmin" && (
                <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  مدیر ارشد
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Contact & Extension Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">شماره داخلی</p>
                <p className="font-bold text-sm font-mono text-foreground">
                  {person.contact.extension || "ندارد"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:border-r sm:pr-3 border-border/50">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[11px]">ایمیل سازمانی</p>
                <p className="font-mono text-xs text-foreground truncate dir-ltr text-right">
                  {person.esp.email || person.npc.email || "ندارد"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:border-r sm:pr-3 border-border/50">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[11px]">محل خدمت</p>
                <p className="text-xs text-foreground truncate font-medium">
                  {person.contact.workLocation.split("/")[0].trim()}{" "}
                  {person.contact.floor ? `(${person.contact.floor.split("/")[0].trim()})` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Company Roles Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>جایگاه و سمت‌های سازمانی در گروه</span>
            </h3>

            {/* Euroslot Pars Role Card */}
            {person.esp.hasRole && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.02] p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-sm">
                    <Building2 className="w-4 h-4" />
                    <span>شرکت مهندسی یورواسلات پارس (Euroslot Pars)</span>
                  </div>
                  {person.esp.personnelCode && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      کد پرسنلی: {person.esp.personnelCode}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">سمت سازمانی:</span>{" "}
                    <span className="font-semibold text-foreground">
                      {person.esp.jobTitleFa || "کارشناس"}
                    </span>
                    {person.esp.jobTitleEn && (
                      <span className="text-muted-foreground block text-[11px] dir-ltr text-right mt-0.5">
                        {person.esp.jobTitleEn}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-muted-foreground">دپارتمان:</span>{" "}
                    <span className="font-semibold text-foreground">
                      {person.esp.department || "مهندسی"}
                    </span>
                  </div>

                  {person.esp.manager && (
                    <div>
                      <span className="text-muted-foreground">مدیر مستقیم:</span>{" "}
                      <span className="font-medium text-foreground">
                        {person.esp.manager}
                      </span>
                    </div>
                  )}

                  {person.esp.email && (
                    <div>
                      <span className="text-muted-foreground">ایمیل اختصاصی ESP:</span>{" "}
                      <span className="font-mono text-foreground dir-ltr inline-block">
                        {person.esp.email}
                      </span>
                    </div>
                  )}
                </div>

                {person.esp.duties && (
                  <div className="pt-2 border-t border-border/40 text-xs">
                    <span className="text-muted-foreground font-medium block mb-1">
                      شرح وظایف و مسئولیت‌ها:
                    </span>
                    <p className="text-muted-foreground leading-relaxed bg-background/50 p-2.5 rounded-xl border border-border/30">
                      {person.esp.duties}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Nano Palayesh Ceram Role Card */}
            {person.npc.hasRole && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    <Building2 className="w-4 h-4" />
                    <span>شرکت نانو پالایش سرام (Nano Palayesh Ceram)</span>
                  </div>
                  {person.npc.personnelCode && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      کد پرسنلی: {person.npc.personnelCode}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">سمت سازمانی:</span>{" "}
                    <span className="font-semibold text-foreground">
                      {person.npc.jobTitleFa || "کارشناس فنی"}
                    </span>
                    {person.npc.jobTitleEn && (
                      <span className="text-muted-foreground block text-[11px] dir-ltr text-right mt-0.5">
                        {person.npc.jobTitleEn}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-muted-foreground">دپارتمان:</span>{" "}
                    <span className="font-semibold text-foreground">
                      {person.npc.department || "نانوپالایش سرام"}
                    </span>
                  </div>

                  {person.npc.manager && (
                    <div>
                      <span className="text-muted-foreground">مدیر مستقیم:</span>{" "}
                      <span className="font-medium text-foreground">
                        {person.npc.manager}
                      </span>
                    </div>
                  )}

                  {person.npc.email && (
                    <div>
                      <span className="text-muted-foreground">ایمیل اختصاصی NPC:</span>{" "}
                      <span className="font-mono text-foreground dir-ltr inline-block">
                        {person.npc.email}
                      </span>
                    </div>
                  )}
                </div>

                {person.npc.duties && (
                  <div className="pt-2 border-t border-border/40 text-xs">
                    <span className="text-muted-foreground font-medium block mb-1">
                      شرح وظایف و مسئولیت‌ها:
                    </span>
                    <p className="text-muted-foreground leading-relaxed bg-background/50 p-2.5 rounded-xl border border-border/30">
                      {person.npc.duties}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Education Info */}
          {(person.education.degree || person.education.university) && (
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>سوابق تحصیلی و دانشگاهی</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                {person.education.degree && (
                  <span>
                    <strong className="text-foreground">مقطع:</strong>{" "}
                    {person.education.degree.split("/")[0].trim()}
                  </span>
                )}
                {person.education.fieldOfStudy && (
                  <span>
                    <strong className="text-foreground">رشته:</strong>{" "}
                    {person.education.fieldOfStudy}
                  </span>
                )}
                {person.education.university && (
                  <span>
                    <strong className="text-foreground">دانشگاه:</strong>{" "}
                    {person.education.university}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl text-xs">
              بستن
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
