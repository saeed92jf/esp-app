// src/modules/customers/components/PhonebookDirectoryView.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  BookUser,
  Search,
  Phone,
  Mail,
  Building2,
  MapPin,
  Star,
  Plus,
  Copy,
  Check,
  Factory,
  Briefcase,
  Wrench,
  Cpu,
  Layers,
  ShieldCheck,
  User,
  ArrowUpRight,
  Filter,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatLocaleNumber } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { contactsService } from "../services/contacts.service";
import type { CompanyContact, ContactDepartment, ContactCreateInput } from "../types/contacts.types";

const DEPARTMENT_CONFIG: Record<
  ContactDepartment,
  { labelFa: string; labelEn: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  management: {
    labelFa: "مدیریت ارشد",
    labelEn: "Management",
    icon: Star,
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  commercial: {
    labelFa: "بازرگانی و قراردادها",
    labelEn: "Commercial",
    icon: Briefcase,
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  procurement: {
    labelFa: "تدارکات و خرید کالا",
    labelEn: "Procurement",
    icon: Layers,
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  technical: {
    labelFa: "فنی و مهندسی",
    labelEn: "Technical",
    icon: Cpu,
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
  },
  maintenance: {
    labelFa: "تعمیرات و اورهال",
    labelEn: "Maintenance",
    icon: Wrench,
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
  },
  operations: {
    labelFa: "بهره‌برداری و تولید",
    labelEn: "Operations",
    icon: Factory,
    color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
  },
  engineering: {
    labelFa: "مهندسی و توسعه",
    labelEn: "Engineering",
    icon: ShieldCheck,
    color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
  },
  other: {
    labelFa: "سایر واحدها",
    labelEn: "Other",
    icon: User,
    color: "bg-muted text-muted-foreground border-border",
  },
};

export function PhonebookDirectoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();

  const initialCompany = searchParams.get("company") || "all";
  const initialSearch = searchParams.get("q") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Add Contact Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState(initialCompany !== "all" ? initialCompany : "");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newDept, setNewDept] = useState<ContactDepartment>("commercial");
  const [newPhone, setNewPhone] = useState("");
  const [newExtension, setNewExtension] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newIsKey, setNewIsKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load contacts
  const refreshContacts = () => {
    const list = contactsService.getContacts({
      search,
      company: selectedCompany,
      department: selectedDept,
    });
    setContacts(list);
  };

  useEffect(() => {
    refreshContacts();
  }, [search, selectedCompany, selectedDept]);

  // Sync if URL search param company changes
  useEffect(() => {
    const companyParam = searchParams.get("company");
    if (companyParam) {
      setSelectedCompany(companyParam);
    }
  }, [searchParams]);

  const companiesList = useMemo(() => {
    const list = contactsService.getCompaniesWithContacts();
    return [
      { value: "all", label: isRtl ? "همه شرکت‌ها و پتروشیمی‌ها" : "All Companies" },
      ...list.map((c) => ({
        value: c.nameFa,
        label: `${c.nameFa} (${formatLocaleNumber(c.count, isRtl)})`,
      })),
    ];
  }, [isRtl, contacts]);

  // Stats calculation
  const totalContactsCount = contacts.length;
  const keyContactsCount = useMemo(() => contacts.filter((c) => c.isKeyContact).length, [contacts]);
  const technicalCount = useMemo(
    () => contacts.filter((c) => c.department === "technical" || c.department === "maintenance" || c.department === "engineering").length,
    [contacts]
  );
  const commercialCount = useMemo(
    () => contacts.filter((c) => c.department === "commercial" || c.department === "procurement").length,
    [contacts]
  );

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(isRtl ? "در حافظه کپی شد." : "Copied to clipboard.");
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newCompanyName.trim()) {
      toast.error(isRtl ? "نام فرد و نام شرکت الزامی هستند." : "Full name and company name are required.");
      return;
    }

    setIsSaving(true);
    try {
      const deptConf = DEPARTMENT_CONFIG[newDept] || DEPARTMENT_CONFIG.other;

      const input: ContactCreateInput = {
        fullNameFa: newFullName.trim(),
        companyNameFa: newCompanyName.trim(),
        jobTitleFa: newJobTitle.trim() || (isRtl ? "کارشناس" : "Specialist"),
        department: newDept,
        departmentTitleFa: deptConf.labelFa,
        phoneDirect: newPhone.trim() || undefined,
        phoneExtension: newExtension.trim() || undefined,
        mobilePhone: newMobile.trim() || undefined,
        email: newEmail.trim() || undefined,
        locationFa: newLocation.trim() || undefined,
        notesFa: newNotes.trim() || undefined,
        isKeyContact: newIsKey,
      };

      contactsService.addContact(input);
      toast.success(isRtl ? "مخاطب جدید با موفقیت به دفترچه تلفن افزوده شد." : "Contact added successfully.");
      setIsAddModalOpen(false);
      // Reset
      setNewFullName("");
      setNewJobTitle("");
      setNewPhone("");
      setNewExtension("");
      setNewMobile("");
      setNewEmail("");
      setNewNotes("");
      setNewIsKey(false);
      refreshContacts();
    } catch {
      toast.error(isRtl ? "خطا در ثبت مخاطب" : "Failed to add contact");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = (id: string, name: string) => {
    if (confirm(isRtl ? `آیا از حذف اطلاعات مخاطب «${name}» اطمینان دارید؟` : `Delete contact "${name}"?`)) {
      contactsService.deleteContact(id);
      toast.success(isRtl ? "مخاطب با موفقیت حذف شد." : "Contact deleted.");
      refreshContacts();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Metrics Banner ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookUser className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "کل مخاطبین در شرکت‌ها" : "Total Directory Contacts"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(totalContactsCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "نفر" : "Persons"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Star className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "مدیران ارشد و کلیدی" : "Key & Senior Execs"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(keyContactsCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "مدیر" : "Execs"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Wrench className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "بخش فنی، تعمیرات و مهندسی" : "Technical & Maintenance"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(technicalCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "متخصص" : "Eng."}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Briefcase className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {isRtl ? "بازرگانی و تدارکات کالا" : "Commercial & Purchasing"}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(commercialCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{isRtl ? "کارشناس" : "Staff"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? "جستجوی نام، سمت، شرکت، شماره تماس، ایمیل یا شهر..." : "Search name, title, company, phone, email..."}
              className="ps-10 h-10 text-xs sm:text-sm rounded-xl bg-muted/30 border-border"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Company Filter Dropdown */}
          <div className="w-full md:w-72">
            <Combobox
              options={companiesList}
              value={selectedCompany}
              onChange={(val) => setSelectedCompany(val)}
              placeholder={isRtl ? "فیلتر بر اساس شرکت..." : "Filter by company..."}
              className="h-10 text-xs sm:text-sm rounded-xl"
            />
          </div>

          {/* Add Contact Button */}
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl h-10 px-4 text-xs font-bold gap-1.5 shrink-0 shadow-xs"
          >
            <Plus className="size-4" />
            <span>{isRtl ? "ثبت مخاطب جدید" : "Add Contact"}</span>
          </Button>
        </div>

        {/* Department Chips Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-muted-foreground font-medium shrink-0 flex items-center gap-1 me-1">
            <Filter className="size-3" />
            <span>{isRtl ? "دپارتمان:" : "Dept:"}</span>
          </span>

          <button
            onClick={() => setSelectedDept("all")}
            className={cn(
              "px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all border",
              selectedDept === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60"
            )}
          >
            {isRtl ? "همه واحدها" : "All Departments"}
          </button>

          {(Object.keys(DEPARTMENT_CONFIG) as ContactDepartment[]).map((dKey) => {
            const conf = DEPARTMENT_CONFIG[dKey];
            const isSelected = selectedDept === dKey;
            const Icon = conf.icon;
            return (
              <button
                key={dKey}
                onClick={() => setSelectedDept(dKey)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all border flex items-center gap-1.5",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60"
                )}
              >
                <Icon className="size-3" />
                <span>{isRtl ? conf.labelFa : conf.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Active Company Filter Notice */}
        {selectedCompany !== "all" && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-primary/5 border border-primary/20 text-xs">
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <Building2 className="size-3.5" />
              <span>{isRtl ? `در حال نمایش مخاطبین شرکت: «${selectedCompany}»` : `Showing contacts for: "${selectedCompany}"`}</span>
            </div>
            <button
              onClick={() => setSelectedCompany("all")}
              className="text-xs text-muted-foreground hover:text-foreground underline flex items-center gap-1"
            >
              <X className="size-3" />
              <span>{isRtl ? "نمایش همه شرکت‌ها" : "Clear filter"}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Contacts Cards Grid ── */}
      {contacts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
          <BookUser className="size-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-sm font-bold text-foreground">
            {isRtl ? "مخاطبی با این مشخصات یافت نشد." : "No contacts found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isRtl
              ? "عبارت جستجو را تغییر دهید یا از دکمه «ثبت مخاطب جدید» برای اضافه کردن فرد استفاده کنید."
              : "Try adjusting your search criteria or add a new contact."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedCompany("all");
              setSelectedDept("all");
            }}
            className="rounded-xl text-xs"
          >
            {isRtl ? "پاک کردن فیلترها" : "Reset Filters"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => {
            const deptConf = DEPARTMENT_CONFIG[contact.department] || DEPARTMENT_CONFIG.other;
            const DeptIcon = deptConf.icon;

            return (
              <div
                key={contact.id}
                className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-150 flex flex-col justify-between gap-4 group"
              >
                {/* Top Section: Avatar, Name, Badges */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="size-11 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary border border-primary/20 flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs">
                        {contact.fullNameFa.slice(0, 1)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-foreground truncate leading-snug">
                            {contact.fullNameFa}
                          </h4>
                          {contact.isKeyContact && (
                            <Badge
                              variant="outline"
                              className="text-[9.5px] px-1.5 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-0.5"
                            >
                              <Star className="size-2.5 fill-current" />
                              <span>{isRtl ? "کلیدی" : "Key"}</span>
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-primary font-medium mt-0.5 truncate" title={contact.jobTitleFa}>
                          {contact.jobTitleFa}
                        </p>
                      </div>
                    </div>

                    {/* Department Badge */}
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-2 py-0.5 shrink-0 border", deptConf.color)}
                    >
                      <DeptIcon className="size-2.5 me-1 inline" />
                      <span>{isRtl ? deptConf.labelFa : deptConf.labelEn}</span>
                    </Badge>
                  </div>

                  {/* Company Name with Link */}
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Factory className="size-3.5 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-foreground truncate" title={contact.companyNameFa}>
                        {contact.companyNameFa}
                      </span>
                    </div>

                    <Link
                      href={`/customers?search=${encodeURIComponent(contact.companyNameFa.replace('شرکت ', '').replace('پتروشیمی ', ''))}`}
                      className="text-[10.5px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 shrink-0"
                      title={isRtl ? "مشاهده پرونده شرکت" : "View Company"}
                    >
                      <span>{isRtl ? "پرونده" : "Dossier"}</span>
                      <ArrowUpRight className="size-3" />
                    </Link>
                  </div>

                  {/* Contact Methods */}
                  <div className="space-y-1.5 text-xs">
                    {/* Direct Phone & Extension */}
                    {(contact.phoneDirect || contact.phoneExtension) && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-muted/15 border border-border/40 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone className="size-3.5 text-primary shrink-0" />
                          <span className="text-[11px] text-muted-foreground">{isRtl ? "تلفن مستقیم:" : "Direct:"}</span>
                          <a
                            href={`tel:${contact.phoneDirect?.replace(/[^0-9+]/g, "") || ""}`}
                            className="font-medium text-foreground hover:underline tabular-nums"
                            dir="ltr"
                          >
                            {contact.phoneDirect}
                            {contact.phoneExtension && (
                              <span className="text-primary ms-1">({isRtl ? `داخلی ${contact.phoneExtension}` : `Ext ${contact.phoneExtension}`})</span>
                            )}
                          </a>
                        </div>

                        {contact.phoneDirect && (
                          <button
                            type="button"
                            onClick={() => handleCopy(`${contact.phoneDirect}${contact.phoneExtension ? ` داخلی ${contact.phoneExtension}` : ""}`, `p-${contact.id}`)}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                            title={isRtl ? "کپی شماره" : "Copy"}
                          >
                            {copiedField === `p-${contact.id}` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Mobile Phone */}
                    {contact.mobilePhone && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-muted/15 border border-border/40 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-[11px] text-muted-foreground">{isRtl ? "شماره همراه:" : "Mobile:"}</span>
                          <a
                            href={`tel:${contact.mobilePhone.replace(/[^0-9+]/g, "")}`}
                            className="font-medium text-foreground hover:underline tabular-nums"
                            dir="ltr"
                          >
                            {contact.mobilePhone}
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(contact.mobilePhone || "", `m-${contact.id}`)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                          title={isRtl ? "کپی شماره" : "Copy"}
                        >
                          {copiedField === `m-${contact.id}` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                    )}

                    {/* Email */}
                    {contact.email && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-muted/15 border border-border/40 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                          <span className="text-[11px] text-muted-foreground">{isRtl ? "ایمیل:" : "Email:"}</span>
                          <a
                            href={`mailto:${contact.email}`}
                            className="font-medium text-foreground hover:underline truncate max-w-[180px] font-sans"
                            dir="ltr"
                          >
                            {contact.email}
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(contact.email || "", `e-${contact.id}`)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                          title={isRtl ? "کپی ایمیل" : "Copy"}
                        >
                          {copiedField === `e-${contact.id}` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                    )}

                    {/* Location */}
                    {contact.locationFa && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                        <MapPin className="size-3 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{contact.locationFa}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {contact.notesFa && (
                      <p className="text-[10.5px] text-muted-foreground/90 bg-muted/30 p-2 rounded-xl border border-border/40 leading-relaxed">
                        {contact.notesFa}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {contact.phoneDirect && (
                      <a
                        href={`tel:${contact.phoneDirect.replace(/[^0-9+]/g, "")}`}
                        className="h-8 px-2.5 text-xs rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center gap-1 transition-colors font-medium"
                      >
                        <Phone className="size-3" />
                        <span>{isRtl ? "تماس" : "Call"}</span>
                      </a>
                    )}

                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="h-8 px-2.5 text-xs rounded-xl bg-muted/40 hover:bg-muted/70 text-foreground border border-border flex items-center gap-1 transition-colors font-medium"
                      >
                        <Mail className="size-3" />
                        <span>{isRtl ? "ایمیل" : "Email"}</span>
                      </a>
                    )}
                  </div>

                  {/* Delete Button (if custom) */}
                  {contact.id.startsWith("cnt-custom") && (
                    <button
                      onClick={() => handleDeleteContact(contact.id, contact.fullNameFa)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title={isRtl ? "حذف مخاطب" : "Delete"}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Contact Modal ── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <BookUser className="size-5 text-primary" />
              <span>{isRtl ? "ثبت مخاطب جدید در دفترچه تلفن" : "Add New Contact"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isRtl
                ? "اطلاعات تماس و سمت فرد در شرکت یا پتروشیمی مربوطه را وارد کنید."
                : "Enter personal contact details, role and company."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContact} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isRtl ? "نام و نام خانوادگی فرد *" : "Full Name *"}</Label>
                <Input
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder={isRtl ? "مثال: مهندس احسان احمدی" : "e.g. John Doe"}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isRtl ? "نام شرکت یا پتروشیمی *" : "Company Name *"}</Label>
                <Input
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder={isRtl ? "مثال: شرکت پتروشیمی جم" : "e.g. Jam Petrochemical"}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isRtl ? "سمت و عنوان سازمانی" : "Job Title"}</Label>
                <Input
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder={isRtl ? "مثال: رئیس تعمیرات برج‌ها" : "e.g. Maintenance Manager"}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isRtl ? "دپارتمان / حوزه فعالیت" : "Department"}</Label>
                <Combobox
                  options={(Object.keys(DEPARTMENT_CONFIG) as ContactDepartment[]).map((d) => ({
                    value: d,
                    label: isRtl ? DEPARTMENT_CONFIG[d].labelFa : DEPARTMENT_CONFIG[d].labelEn,
                  }))}
                  value={newDept}
                  onChange={(val) => setNewDept(val as ContactDepartment)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold">{isRtl ? "تلفن مستقیم دفتر" : "Direct Phone"}</Label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="021-xxxxxxxx"
                  className="h-9 text-xs rounded-xl font-sans"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isRtl ? "داخلی" : "Extension"}</Label>
                <Input
                  value={newExtension}
                  onChange={(e) => setNewExtension(e.target.value)}
                  placeholder="120"
                  className="h-9 text-xs rounded-xl font-sans"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isRtl ? "شماره همراه (موبایل)" : "Mobile Phone"}</Label>
                <Input
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="0912xxxxxxx"
                  className="h-9 text-xs rounded-xl font-sans"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isRtl ? "ایمیل سازمانی / مستقیم" : "Email"}</Label>
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="h-9 text-xs rounded-xl font-sans"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isRtl ? "محل استقرار (دفتر / مجتمع)" : "Location"}</Label>
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder={isRtl ? "مثال: دفتر تهران / مجتمع عسلویه فاز ۱" : "e.g. Tehran HQ / Assaluyeh Site"}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isRtl ? "توضیحات و زمینه همکاری" : "Notes"}</Label>
              <Textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder={isRtl ? "توضیحات سوابق قراردادها، پروژه‌های مشترک و تجهیزات..." : "Collaboration notes..."}
                className="min-h-[50px] text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50">
              <Switch checked={newIsKey} onCheckedChange={setNewIsKey} id="new-key-switch" />
              <Label htmlFor="new-key-switch" className="text-xs font-semibold cursor-pointer">
                {isRtl ? "علامت‌گذاری به عنوان مخاطب کلیدی و مدیر تصمیم‌گیر" : "Mark as Key Decision Maker"}
              </Label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl h-9 text-xs"
              >
                {isRtl ? "انصراف" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl h-9 text-xs font-bold gap-1.5"
              >
                {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                <span>{isRtl ? "ثبت مخاطب" : "Save Contact"}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
