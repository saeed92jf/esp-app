// src/modules/customers/components/PhonebookDirectoryView.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  Search,
  Mic,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User,
  UserPlus,
  Phone,
  Mail,
  Building2,
  Camera,
  Star,
  Copy,
  Check,
  Trash2,
  Pencil,
  X,
  ExternalLink,
  MessageCircle,
  Briefcase,
  Layers,
  Cpu,
  Wrench,
  Factory,
  ShieldCheck,
  CheckCircle2,
  Share2,
  ArrowUpRight,
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

const AVATAR_PALETTES = [
  "from-emerald-500/20 to-emerald-600/30 text-emerald-800 dark:text-emerald-200 border-emerald-500/30",
  "from-amber-500/20 to-amber-600/30 text-amber-800 dark:text-amber-200 border-amber-500/30",
  "from-blue-500/20 to-blue-600/30 text-blue-800 dark:text-blue-200 border-blue-500/30",
  "from-purple-500/20 to-purple-600/30 text-purple-800 dark:text-purple-200 border-purple-500/30",
  "from-rose-500/20 to-rose-600/30 text-rose-800 dark:text-rose-200 border-rose-500/30",
  "from-teal-500/20 to-teal-600/30 text-teal-800 dark:text-teal-200 border-teal-500/30",
  "from-indigo-500/20 to-indigo-600/30 text-indigo-800 dark:text-indigo-200 border-indigo-500/30",
  "from-cyan-500/20 to-cyan-600/30 text-cyan-800 dark:text-cyan-200 border-cyan-500/30",
];

function getAvatarPalette(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

export function PhonebookDirectoryView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();

  const initialCompany = searchParams.get("company") || "all";
  const initialSearch = searchParams.get("q") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Active Selected Contact or New Contact Mode
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMoreFieldsOpen, setIsMoreFieldsOpen] = useState(false);

  // Form State
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formDept, setFormDept] = useState<ContactDepartment>("commercial");
  const [formPhone, setFormPhone] = useState("");
  const [formExtension, setFormExtension] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formIsKey, setFormIsKey] = useState(false);
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load contacts
  const refreshContacts = () => {
    let list = contactsService.getContacts({
      search,
      company: selectedCompany,
      department: selectedDept,
    });
    if (onlyFavourites) {
      list = list.filter((c) => c.isKeyContact);
    }
    setContacts(list);
  };

  useEffect(() => {
    refreshContacts();
  }, [search, selectedCompany, selectedDept, onlyFavourites]);

  useEffect(() => {
    const companyParam = searchParams.get("company");
    if (companyParam) {
      setSelectedCompany(companyParam);
    }
  }, [searchParams]);

  // Set initial selected contact (first contact) on desktop if none selected
  useEffect(() => {
    if (!selectedContactId && !isCreatingNew && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId, isCreatingNew]);

  const selectedContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId) || null;
  }, [contacts, selectedContactId]);

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

  const favouriteContacts = useMemo(() => {
    return contacts.filter((c) => c.isKeyContact);
  }, [contacts]);

  // Alphabetical Grouping
  const alphabeticalGroups = useMemo(() => {
    const groups: Record<string, CompanyContact[]> = {};

    for (const contact of contacts) {
      let clean = (isRtl ? contact.fullNameFa : contact.fullNameEn || contact.fullNameFa).trim();
      clean = clean.replace(/^(مهندس|دکتر|آقای|خانم|مهندس\s+ارشد|جناب|استاد)\s+/i, "");
      let letter = clean[0] || "#";
      if (letter === "آ" || letter === "ا") {
        letter = isRtl ? "الف" : "A";
      } else {
        letter = letter.toUpperCase();
      }

      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(contact);
    }

    const sortedLetters = Object.keys(groups).sort((a, b) =>
      a.localeCompare(b, isRtl ? "fa" : "en")
    );

    return sortedLetters.map((letter) => ({
      letter,
      contacts: groups[letter].sort((a, b) =>
        a.fullNameFa.localeCompare(b.fullNameFa, isRtl ? "fa" : "en")
      ),
    }));
  }, [contacts, isRtl]);

  const handleCopy = (text: string, fieldId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(isRtl ? "در حافظه کپی شد." : "Copied to clipboard.");
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleToggleKey = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updatedState = contactsService.toggleKeyContact(id);
    refreshContacts();
    toast.success(
      updatedState
        ? isRtl
          ? "به مخاطبین برگزیده اضافه شد."
          : "Added to favourites."
        : isRtl
        ? "از مخاطبین برگزیده حذف شد."
        : "Removed from favourites."
    );
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setIsEditing(false);
    setSelectedContactId(null);
    setFormFirstName("");
    setFormLastName("");
    setFormCompanyName(selectedCompany !== "all" ? selectedCompany : "شرکت صنایع پتروشیمی خلیج فارس");
    setFormJobTitle("");
    setFormDept("commercial");
    setFormPhone("");
    setFormExtension("");
    setFormMobile("");
    setFormEmail("");
    setFormLocation("");
    setFormNotes("");
    setFormIsKey(false);
    setFormAvatarUrl("");
    setIsMoreFieldsOpen(false);
    setIsMobileModalOpen(true);
  };

  const handleStartEdit = (contact: CompanyContact) => {
    setIsEditing(true);
    setIsCreatingNew(true);
    const parts = contact.fullNameFa.split(" ");
    setFormFirstName(parts[0] || "");
    setFormLastName(parts.slice(1).join(" ") || "");
    setFormCompanyName(contact.companyNameFa);
    setFormJobTitle(contact.jobTitleFa);
    setFormDept(contact.department);
    setFormPhone(contact.phoneDirect || "");
    setFormExtension(contact.phoneExtension || "");
    setFormMobile(contact.mobilePhone || "");
    setFormEmail(contact.email || "");
    setFormLocation(contact.locationFa || "");
    setFormNotes(contact.notesFa || "");
    setFormIsKey(Boolean(contact.isKeyContact));
    setFormAvatarUrl(contact.avatarUrl || "");
    setIsMoreFieldsOpen(true);
    setIsMobileModalOpen(true);
  };

  const handleSaveContact = (e?: React.FormEvent) => {
    e?.preventDefault();
    const fullName = `${formFirstName} ${formLastName}`.trim();
    if (!fullName || !formCompanyName.trim()) {
      toast.error(isRtl ? "نام فرد و نام شرکت الزامی هستند." : "Full name and company name are required.");
      return;
    }

    setIsSaving(true);
    try {
      const deptConf = DEPARTMENT_CONFIG[formDept] || DEPARTMENT_CONFIG.other;

      if (isEditing && selectedContactId) {
        contactsService.updateContact(selectedContactId, {
          fullNameFa: fullName,
          companyNameFa: formCompanyName.trim(),
          jobTitleFa: formJobTitle.trim() || (isRtl ? "کارشناس" : "Specialist"),
          department: formDept,
          departmentTitleFa: deptConf.labelFa,
          phoneDirect: formPhone.trim() || undefined,
          phoneExtension: formExtension.trim() || undefined,
          mobilePhone: formMobile.trim() || undefined,
          email: formEmail.trim() || undefined,
          locationFa: formLocation.trim() || undefined,
          notesFa: formNotes.trim() || undefined,
          isKeyContact: formIsKey,
          avatarUrl: formAvatarUrl || undefined,
        });
        toast.success(isRtl ? "اطلاعات مخاطب به‌روزرسانی شد." : "Contact updated successfully.");
      } else {
        const input: ContactCreateInput = {
          fullNameFa: fullName,
          companyNameFa: formCompanyName.trim(),
          jobTitleFa: formJobTitle.trim() || (isRtl ? "کارشناس" : "Specialist"),
          department: formDept,
          departmentTitleFa: deptConf.labelFa,
          phoneDirect: formPhone.trim() || undefined,
          phoneExtension: formExtension.trim() || undefined,
          mobilePhone: formMobile.trim() || undefined,
          email: formEmail.trim() || undefined,
          locationFa: formLocation.trim() || undefined,
          notesFa: formNotes.trim() || undefined,
          isKeyContact: formIsKey,
        };

        const created = contactsService.addContact(input);
        setSelectedContactId(created.id);
        toast.success(isRtl ? "مخاطب جدید با موفقیت ذخیره شد." : "Contact created successfully.");
      }

      setIsCreatingNew(false);
      setIsEditing(false);
      setIsMobileModalOpen(false);
      refreshContacts();
    } catch {
      toast.error(isRtl ? "خطا در ذخیره مخاطب" : "Failed to save contact");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = (id: string, name: string) => {
    if (confirm(isRtl ? `آیا از حذف مخاطب «${name}» اطمینان دارید؟` : `Delete contact "${name}"?`)) {
      contactsService.deleteContact(id);
      toast.success(isRtl ? "مخاطب با موفقیت حذف شد." : "Contact deleted.");
      if (selectedContactId === id) {
        setSelectedContactId(null);
      }
      setIsMobileModalOpen(false);
      refreshContacts();
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setFormAvatarUrl(ev.target.result as string);
          toast.success(isRtl ? "تصویر با موفقیت انتخاب شد." : "Avatar photo selected.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceSearch = () => {
    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info(
        isRtl
          ? "جستجوی صوتی در این مرورگر پشتیبانی نمی‌شود؛ لطفاً متن را تایپ کنید."
          : "Voice search not supported in this browser; please type your query."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isRtl ? "fa-IR" : "en-US";
      recognition.start();
      toast.info(isRtl ? "در حال شنیدن... لطفاً نام مخاطب را بگویید" : "Listening... Speak contact name");

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearch(transcript);
          toast.success(isRtl ? `جستجو برای: «${transcript}»` : `Searching for: "${transcript}"`);
        }
      };

      recognition.onerror = () => {
        toast.error(isRtl ? "خطا در دریافت صدا" : "Voice input error");
      };
    } catch {
      toast.error(isRtl ? "عدم دسترسی به میکروفون" : "Microphone unavailable");
    }
  };

  // ── Render Right Panel (New or Selected Contact) ──
  const renderRightPanelContent = () => {
    if (isCreatingNew) {
      return (
        <div className="w-full flex flex-col bg-card rounded-[28px] border border-border/80 shadow-md overflow-hidden animate-in fade-in duration-150">
          {/* Top Bar */}
          <div className="px-5 py-3.5 bg-background/90 backdrop-blur-sm border-b border-border/60 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setIsCreatingNew(false);
                setIsEditing(false);
                setIsMobileModalOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
            >
              <ChevronLeft className={cn("size-5", isRtl && "rotate-180")} />
            </Button>

            <span className="font-bold text-sm sm:text-base text-foreground">
              {isEditing
                ? isRtl
                  ? "ویرایش اطلاعات مخاطب"
                  : "Edit contact"
                : isRtl
                ? "ایجاد مخاطب جدید"
                : "Create new contact"}
            </span>

            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveContact}
              disabled={isSaving}
              className="text-[#65874f] dark:text-[#8ea979] hover:text-[#4d693c] dark:hover:text-[#a5c090] font-bold text-sm h-8 px-2 cursor-pointer hover:bg-transparent"
            >
              {isSaving ? isRtl ? "در حال ذخیره..." : "saving..." : isRtl ? "ذخیره" : "save"}
            </Button>
          </div>

          <form onSubmit={handleSaveContact} className="p-0 space-y-0">
            {/* Sage Green Hero Banner with Avatar */}
            <div className="bg-[#8fa878] dark:bg-[#344d28] p-6 pb-12 flex flex-col items-center justify-center relative shadow-inner text-white">
              <div className="relative group">
                <div className="size-24 rounded-full border-3 border-white/80 flex items-center justify-center bg-white/10 text-white shadow-md overflow-hidden">
                  {formAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formAvatarUrl} alt="Avatar" className="size-full object-cover" />
                  ) : (
                    <User className="size-14 text-white/90" strokeWidth={1.5} />
                  )}
                </div>

                {/* Camera upload button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  onClick={() => fileInputRef.current?.click()}
                  className="size-8 rounded-full bg-white dark:bg-card text-foreground shadow-md absolute bottom-0 end-0 p-0 border border-border/80 hover:bg-muted cursor-pointer hover:scale-105 transition-transform"
                  title={isRtl ? "بارگذاری عکس مخاطب" : "Upload photo"}
                >
                  <Camera className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Floating Card 1: Saving to (Company) */}
            <div className="-mt-6 mx-4 rounded-2xl bg-card border border-border/80 shadow-sm p-3 flex items-center gap-3 relative z-10">
              <div className="size-10 rounded-xl bg-[#8fa878]/15 text-[#65874f] dark:text-[#8ea979] flex items-center justify-center shrink-0">
                <Building2 className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                  {isRtl ? "ذخیره در شرکت یا واحد صنعتی:" : "saving to"}
                </span>
                <Input
                  value={formCompanyName}
                  onChange={(e) => setFormCompanyName(e.target.value)}
                  placeholder={isRtl ? "نام شرکت یا پتروشیمی..." : "Company / Complex name..."}
                  className="w-full text-xs sm:text-sm font-semibold text-foreground bg-transparent border-0 p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 h-auto"
                  required
                />
              </div>
            </div>

            {/* Floating Card 2: Contact Form Inputs */}
            <div className="mt-3 mx-4 rounded-2xl bg-card border border-border/80 shadow-md p-4 space-y-4">
              {/* Person Section */}
              <div className="flex items-start gap-3">
                <div className="size-7 rounded-lg bg-[#8fa878]/10 text-[#65874f] dark:text-[#8ea979] flex items-center justify-center shrink-0 mt-1">
                  <User className="size-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder={isRtl ? "نام کوچک (First name)" : "Enter your First name"}
                    className="h-9 text-xs sm:text-sm border-0 border-b border-border/70 rounded-none px-1 bg-transparent focus-visible:ring-0 focus-visible:border-[#65874f]"
                    required
                  />
                  <Input
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder={isRtl ? "نام خانوادگی (Last name)" : "Last name"}
                    className="h-9 text-xs sm:text-sm border-0 border-b border-border/70 rounded-none px-1 bg-transparent focus-visible:ring-0 focus-visible:border-[#65874f]"
                  />
                  <Input
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    placeholder={isRtl ? "سمت سازمانی (Job title)" : "Job title"}
                    className="h-9 text-xs sm:text-sm border-0 border-b border-border/70 rounded-none px-1 bg-transparent focus-visible:ring-0 focus-visible:border-[#65874f]"
                  />
                </div>
              </div>

              {/* Phone Section */}
              <div className="flex items-start gap-3 pt-2">
                <div className="size-7 rounded-lg bg-[#8fa878]/10 text-[#65874f] dark:text-[#8ea979] flex items-center justify-center shrink-0 mt-1">
                  <Phone className="size-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder={isRtl ? "تلفن مستقیم (Phone)" : "Phone"}
                    dir="ltr"
                    className="h-9 text-xs sm:text-sm border-0 border-b border-border/70 rounded-none px-1 bg-transparent focus-visible:ring-0 focus-visible:border-[#65874f]"
                  />
                  <Input
                    value={formExtension}
                    onChange={(e) => setFormExtension(e.target.value)}
                    placeholder={isRtl ? "داخلی (Extension)" : "Extension"}
                    dir="ltr"
                    className="h-9 text-xs sm:text-sm border-0 border-b border-border/70 rounded-none px-1 bg-transparent focus-visible:ring-0 focus-visible:border-[#65874f]"
                  />
                  <Input
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    placeholder={isRtl ? "شماره همراه (Mobile)" : "Mobile"}
                    dir="ltr"
                    className="h-9 text-xs sm:text-sm border-0 border-b border-border/70 rounded-none px-1 bg-transparent focus-visible:ring-0 focus-visible:border-[#65874f]"
                  />
                </div>
              </div>

              {/* Mail Section */}
              <div className="flex items-start gap-3 pt-2">
                <div className="size-7 rounded-lg bg-[#8fa878]/10 text-[#65874f] dark:text-[#8ea979] flex items-center justify-center shrink-0 mt-1">
                  <Mail className="size-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder={isRtl ? "پست الکترونیکی (Email)" : "Email"}
                    dir="ltr"
                    type="email"
                    className="h-9 text-xs sm:text-sm border-0 border-b border-border/70 rounded-none px-1 bg-transparent focus-visible:ring-0 focus-visible:border-[#65874f]"
                  />
                  <Input
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder={isRtl ? "موقعیت / دفتر (Office / Site)" : "Office / Home"}
                    className="h-9 text-xs sm:text-sm border-0 border-b border-border/70 rounded-none px-1 bg-transparent focus-visible:ring-0 focus-visible:border-[#65874f]"
                  />
                </div>
              </div>
            </div>

            {/* MORE FIELDS Button */}
            <div className="p-4 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsMoreFieldsOpen(!isMoreFieldsOpen)}
                className="w-full text-[#65874f] dark:text-[#8ea979] font-bold text-xs uppercase tracking-wider hover:bg-muted/40 h-8 gap-1 cursor-pointer"
              >
                <span>{isRtl ? "فیلدهای بیشتر و واحد سازمانی" : "MORE FIELDS"}</span>
                <ChevronDown className={cn("size-3.5 transition-transform", isMoreFieldsOpen && "rotate-180")} />
              </Button>

              {isMoreFieldsOpen && (
                <div className="mt-3 p-3.5 rounded-2xl bg-muted/20 border border-border/70 space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{isRtl ? "واحد / دپارتمان سازمانی:" : "Department:"}</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(DEPARTMENT_CONFIG) as ContactDepartment[]).map((dKey) => {
                        const conf = DEPARTMENT_CONFIG[dKey];
                        const isSelected = formDept === dKey;
                        const Icon = conf.icon;
                        return (
                          <Button
                            key={dKey}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="xs"
                            onClick={() => setFormDept(dKey)}
                            className="h-7 text-[11px] justify-start gap-1.5"
                          >
                            <Icon className="size-3" />
                            <span className="truncate">{isRtl ? conf.labelFa : conf.labelEn}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{isRtl ? "توضیحات و سوابق همکاری:" : "Notes:"}</Label>
                    <Textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder={isRtl ? "یادداشت‌های مرتبط با پروژه‌ها و پیگیری‌ها..." : "Project notes and communication history..."}
                      className="text-xs min-h-[70px] rounded-xl"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold">{isRtl ? "مخاطب کلیدی و برگزیده" : "Add to Favourites"}</Label>
                      <p className="text-[10px] text-muted-foreground">{isRtl ? "نمایش در بخش افراد برگزیده بالای لیست" : "Show in top favourites list"}</p>
                    </div>
                    <Switch checked={formIsKey} onCheckedChange={setFormIsKey} />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      );
    }

    if (selectedContact) {
      const deptConf = DEPARTMENT_CONFIG[selectedContact.department] || DEPARTMENT_CONFIG.other;
      const DeptIcon = deptConf.icon;

      return (
        <div className="w-full flex flex-col bg-card rounded-[28px] border border-border/80 shadow-md overflow-hidden animate-in fade-in duration-150">
          {/* Top Bar */}
          <div className="px-5 py-3.5 bg-background/90 backdrop-blur-sm border-b border-border/60 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setSelectedContactId(null);
                setIsMobileModalOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
            >
              <ChevronLeft className={cn("size-5", isRtl && "rotate-180")} />
            </Button>

            <span className="font-bold text-sm sm:text-base text-foreground truncate max-w-[200px]">
              {selectedContact.fullNameFa}
            </span>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(e) => handleToggleKey(selectedContact.id, e)}
                className="text-muted-foreground hover:text-amber-500 rounded-lg cursor-pointer"
                title={selectedContact.isKeyContact ? (isRtl ? "حذف از برگزیده‌ها" : "Remove favourite") : (isRtl ? "افزودن به برگزیده‌ها" : "Add to favourites")}
              >
                <Star className={cn("size-4", selectedContact.isKeyContact ? "fill-amber-500 text-amber-500" : "")} />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => handleStartEdit(selectedContact)}
                className="text-muted-foreground hover:text-primary rounded-lg cursor-pointer"
                title={isRtl ? "ویرایش" : "Edit"}
              >
                <Pencil className="size-4" />
              </Button>
            </div>
          </div>

          {/* Sage Green Hero Banner with Avatar */}
          <div className="bg-[#8fa878] dark:bg-[#344d28] p-6 pb-12 flex flex-col items-center justify-center relative shadow-inner text-white text-center">
            <div className="size-24 rounded-full border-3 border-white/80 flex items-center justify-center bg-white/10 text-white shadow-md overflow-hidden">
              {selectedContact.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedContact.avatarUrl} alt={selectedContact.fullNameFa} className="size-full object-cover" />
              ) : (
                <div className="text-3xl font-bold font-sans">
                  {selectedContact.fullNameFa.slice(0, 1)}
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-white mt-3 leading-snug">
              {selectedContact.fullNameFa}
            </h3>
            <p className="text-xs text-white/85 font-medium mt-0.5">
              {selectedContact.jobTitleFa}
            </p>
          </div>

          {/* Floating Card 1: Company Profile with Link */}
          <div className="-mt-6 mx-4 rounded-2xl bg-card border border-border/80 shadow-sm p-3.5 flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-[#8fa878]/15 text-[#65874f] dark:text-[#8ea979] flex items-center justify-center shrink-0">
                <Building2 className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                  {isRtl ? "شرکت و مجتمع تابعه:" : "Company / Complex"}
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground truncate block">
                  {selectedContact.companyNameFa}
                </span>
              </div>
            </div>

            <Link
              href={`/customers?search=${encodeURIComponent(selectedContact.companyNameFa)}`}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/40 transition-colors shrink-0"
              title={isRtl ? "مشاهده پرونده شرکت در بخش کارفرمایان" : "View Company"}
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          {/* Floating Card 2: Contact Information Details */}
          <div className="mt-3 mx-4 rounded-2xl bg-card border border-border/80 shadow-md p-4 space-y-3.5">
            {/* Direct Phone */}
            {selectedContact.phoneDirect && (
              <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-lg bg-[#8fa878]/10 text-[#65874f] dark:text-[#8ea979] flex items-center justify-center shrink-0">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">{isRtl ? "تلفن مستقیم" : "Direct Phone"}</span>
                    <a
                      href={`tel:${selectedContact.phoneDirect}`}
                      dir="ltr"
                      className="text-xs sm:text-sm font-semibold text-foreground hover:text-[#65874f] font-mono"
                    >
                      {selectedContact.phoneDirect}
                      {selectedContact.phoneExtension ? ` (داخلی ${selectedContact.phoneExtension})` : ""}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => handleCopy(selectedContact.phoneDirect || "", "p-dir", e)}
                    className="size-7 text-muted-foreground hover:text-foreground"
                    title={isRtl ? "کپی شماره" : "Copy"}
                  >
                    {copiedField === "p-dir" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    asChild
                    className="h-7 px-2 text-[11px] gap-1 border-border/60 hover:bg-[#8fa878]/10 hover:text-[#65874f]"
                  >
                    <a href={`tel:${selectedContact.phoneDirect}`}>
                      <Phone className="size-3" />
                      <span>{isRtl ? "تماس" : "Call"}</span>
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile Phone */}
            {selectedContact.mobilePhone && (
              <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-lg bg-[#8fa878]/10 text-[#65874f] dark:text-[#8ea979] flex items-center justify-center shrink-0">
                    <MessageCircle className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">{isRtl ? "شماره همراه" : "Mobile"}</span>
                    <a
                      href={`tel:${selectedContact.mobilePhone}`}
                      dir="ltr"
                      className="text-xs sm:text-sm font-semibold text-foreground hover:text-[#65874f] font-mono"
                    >
                      {selectedContact.mobilePhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => handleCopy(selectedContact.mobilePhone || "", "p-mob", e)}
                    className="size-7 text-muted-foreground hover:text-foreground"
                    title={isRtl ? "کپی شماره" : "Copy"}
                  >
                    {copiedField === "p-mob" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    asChild
                    className="h-7 px-2 text-[11px] gap-1 border-border/60 hover:bg-emerald-500/10 hover:text-emerald-600"
                  >
                    <a
                      href={`https://wa.me/${selectedContact.mobilePhone.replace(/[^0-9]/g, "").replace(/^0/, "98")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-3" />
                      <span>{isRtl ? "پیام" : "WhatsApp"}</span>
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Email */}
            {selectedContact.email && (
              <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-lg bg-[#8fa878]/10 text-[#65874f] dark:text-[#8ea979] flex items-center justify-center shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-muted-foreground block">{isRtl ? "ایمیل سازمانی" : "Email"}</span>
                    <a
                      href={`mailto:${selectedContact.email}`}
                      dir="ltr"
                      className="text-xs sm:text-sm font-semibold text-foreground hover:text-[#65874f] truncate block"
                    >
                      {selectedContact.email}
                    </a>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => handleCopy(selectedContact.email || "", "p-mail", e)}
                  className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                  title={isRtl ? "کپی ایمیل" : "Copy"}
                >
                  {copiedField === "p-mail" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                </Button>
              </div>
            )}

            {/* Department & Location */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-muted/15 border border-border/40">
                <span className="text-[10px] text-muted-foreground block">{isRtl ? "دپارتمان" : "Department"}</span>
                <Badge variant="outline" className={cn("text-[10px] mt-1 gap-1 border", deptConf.color)}>
                  <DeptIcon className="size-2.5" />
                  <span>{isRtl ? deptConf.labelFa : deptConf.labelEn}</span>
                </Badge>
              </div>

              <div className="p-2 rounded-xl bg-muted/15 border border-border/40">
                <span className="text-[10px] text-muted-foreground block">{isRtl ? "موقعیت" : "Location"}</span>
                <span className="text-[11px] font-medium text-foreground truncate block mt-1">
                  {selectedContact.locationFa || (isRtl ? "دفتر مرکزی" : "Headquarters")}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedContact.notesFa && (
              <div className="p-2.5 rounded-xl bg-muted/15 border border-border/40 space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold block">{isRtl ? "یادداشت‌ها و جزئیات:" : "Notes:"}</span>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedContact.notesFa}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Actions Bar */}
          <div className="p-4 pt-3 flex items-center justify-between gap-2 border-t border-border/60 bg-muted/10 mt-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleStartCreateNew}
              className="rounded-xl text-xs gap-1.5 border-[#8fa878]/40 hover:bg-[#8fa878]/10 text-[#65874f] dark:text-[#8ea979]"
            >
              <UserPlus className="size-3.5" />
              <span>{isRtl ? "مخاطب جدید" : "New Contact"}</span>
            </Button>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleStartEdit(selectedContact)}
                className="rounded-xl text-xs gap-1"
              >
                <Pencil className="size-3" />
                <span>{isRtl ? "ویرایش" : "Edit"}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDeleteContact(selectedContact.id, selectedContact.fullNameFa)}
                className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title={isRtl ? "حذف مخاطب" : "Delete"}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Default Empty State on Right Panel: Prompt to create new
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 text-center bg-card rounded-[28px] border border-border/80 shadow-md min-h-[460px]">
        <div className="size-20 rounded-full bg-[#8fa878]/15 text-[#65874f] dark:text-[#8ea979] flex items-center justify-center mb-4">
          <UserPlus className="size-9" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          {isRtl ? "ثبت یا انتخاب مخاطب" : "Select or Add Contact"}
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
          {isRtl
            ? "برای مشاهده شماره‌ها و ارسال پیام، یک مخاطب را از فهرست انتخاب کنید یا بر روی دکمه زیر کلیک نمایید."
            : "Select a contact from the list to view details or click below to create a new entry."}
        </p>
        <Button
          type="button"
          onClick={handleStartCreateNew}
          className="mt-5 rounded-2xl h-10 px-5 text-xs font-bold gap-2 bg-[#65874f] hover:bg-[#547340] text-white shadow-sm"
        >
          <UserPlus className="size-4" />
          <span>{isRtl ? "ایجاد مخاطب جدید" : "Create new contact"}</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Main Two-Column Layout (Matching the user's design) ── */}
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
        {/* ── LEFT COLUMN: Contact List ── */}
        <div className="flex-1 w-full space-y-4">
          {/* Top Search Bar with Mic & 3-Dots */}
          <div className="flex items-center gap-2 p-1.5 ps-3 pe-2 rounded-2xl bg-muted/30 dark:bg-muted/20 border border-border/80 shadow-2xs">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? "جستجوی مخاطبین (نام، شرکت، سمت، تلفن)..." : "Search contacts"}
              className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0 shadow-none h-8 px-1"
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearch("")}
                className="size-7 text-muted-foreground hover:text-foreground rounded-full"
              >
                <X className="size-3.5" />
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleVoiceSearch}
              className="size-8 text-[#65874f] dark:text-[#8ea979] hover:bg-[#8fa878]/15 rounded-full cursor-pointer"
              title={isRtl ? "جستجوی صوتی" : "Voice search"}
            >
              <Mic className="size-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="size-8 text-muted-foreground hover:text-foreground rounded-full cursor-pointer"
                  title={isRtl ? "گزینه‌ها و فیلترها" : "More options"}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
                <DropdownMenuItem
                  onClick={() => setOnlyFavourites(!onlyFavourites)}
                  className="text-xs cursor-pointer gap-2"
                >
                  <Star className={cn("size-3.5", onlyFavourites ? "fill-amber-500 text-amber-500" : "")} />
                  <span>{onlyFavourites ? (isRtl ? "نمایش همه مخاطبین" : "Show all contacts") : (isRtl ? "فقط مخاطبین برگزیده" : "Show favourites only")}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
                  {isRtl ? "فیلتر بر اساس دپارتمان:" : "Filter by department:"}
                </div>
                {(Object.keys(DEPARTMENT_CONFIG) as ContactDepartment[]).slice(0, 5).map((dKey) => {
                  const conf = DEPARTMENT_CONFIG[dKey];
                  return (
                    <DropdownMenuItem
                      key={dKey}
                      onClick={() => setSelectedDept(selectedDept === dKey ? "all" : dKey)}
                      className={cn("text-xs cursor-pointer gap-2", selectedDept === dKey && "font-bold text-primary")}
                    >
                      <span>{isRtl ? conf.labelFa : conf.labelEn}</span>
                      {selectedDept === dKey && <Check className="size-3 ms-auto" />}
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSearch("");
                    setSelectedCompany("all");
                    setSelectedDept("all");
                    setOnlyFavourites(false);
                  }}
                  className="text-xs cursor-pointer text-muted-foreground"
                >
                  {isRtl ? "پاک‌سازی همه فیلترها" : "Clear all filters"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* "My Profile" Row (Euroslot Pars Official Contact) */}
          <div
            onClick={() => {
              toast.info(isRtl ? "اطلاعات تماس دفتر مرکزی یوروسلات پارس" : "Euroslot Pars HQ Contact");
            }}
            className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs hover:border-[#8fa878]/50 hover:bg-[#8fa878]/5 transition-all flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 rounded-full bg-[#8fa878]/15 text-[#65874f] dark:text-[#8ea979] border border-[#8fa878]/30 flex items-center justify-center shrink-0 font-bold text-xs">
                ESP
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#65874f] transition-colors truncate">
                  {isRtl ? "پروفایل من (یوروسلات پارس - دفتر مرکزی)" : "My profile"}
                </h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  {isRtl ? "واحد مهندسی و فروش • ۰۲۱-۸۸۸۸۰۰۰۰" : "Engineering & Sales • Euroslot Pars"}
                </p>
              </div>
            </div>

            <ChevronRight className={cn("size-4 text-muted-foreground group-hover:text-foreground transition-transform", isRtl && "rotate-180")} />
          </div>

          {/* "My Favourites" Section */}
          {favouriteContacts.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{isRtl ? "مخاطبین برگزیده" : "My favourites"}</span>
                  <span className="text-[10.5px] font-normal text-muted-foreground tabular-nums">
                    ({formatLocaleNumber(favouriteContacts.length, isRtl)})
                  </span>
                </div>
              </div>

              {/* Horizontal Scroll / Chips of Favourites */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                {favouriteContacts.map((fav) => {
                  const palette = getAvatarPalette(fav.id);
                  const isSelected = selectedContactId === fav.id;

                  return (
                    <div
                      key={fav.id}
                      onClick={() => {
                        setSelectedContactId(fav.id);
                        setIsCreatingNew(false);
                        setIsMobileModalOpen(true);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 p-2 pe-3 rounded-2xl border transition-all cursor-pointer shrink-0 bg-card hover:shadow-sm",
                        isSelected
                          ? "border-[#65874f] ring-2 ring-[#8fa878]/30 bg-[#8fa878]/5"
                          : "border-border/80 hover:border-border"
                      )}
                    >
                      <div
                        className={cn(
                          "size-9 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-xs border shrink-0",
                          palette
                        )}
                      >
                        {fav.fullNameFa.slice(0, 1)}
                      </div>
                      <div className="text-start">
                        <div className="text-xs font-bold text-foreground truncate max-w-[120px]">
                          {fav.fullNameFa}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {fav.companyNameFa.split(" ")[0]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Alphabetical Contact List ── */}
          {contacts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
              <User className="size-12 mx-auto text-muted-foreground/40" />
              <h3 className="text-sm font-bold text-foreground">
                {isRtl ? "مخاطبی یافت نشد" : "No contacts found"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {isRtl
                  ? "عبارت دیگری را جستجو کنید یا مخاطب جدید اضافه نمایید."
                  : "Try a different search term or create a new contact."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartCreateNew}
                className="rounded-xl text-xs gap-1.5"
              >
                <UserPlus className="size-3.5" />
                <span>{isRtl ? "ایجاد مخاطب جدید" : "Create new contact"}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {alphabeticalGroups.map((group) => (
                <div key={group.letter} className="flex items-start gap-3 sm:gap-4">
                  {/* Alphabet Letter on Side Margin */}
                  <div className="w-6 sm:w-7 pt-2 text-start shrink-0">
                    <span className="text-sm sm:text-base font-bold text-muted-foreground/80 font-sans sticky top-2">
                      {group.letter}
                    </span>
                  </div>

                  {/* Contacts under this letter */}
                  <div className="flex-1 space-y-1.5">
                    {group.contacts.map((c) => {
                      const palette = getAvatarPalette(c.id);
                      const isSelected = selectedContactId === c.id && !isCreatingNew;

                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedContactId(c.id);
                            setIsCreatingNew(false);
                            setIsMobileModalOpen(true);
                          }}
                          className={cn(
                            "flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer bg-card group",
                            isSelected
                              ? "border-[#65874f] ring-2 ring-[#8fa878]/30 bg-[#8fa878]/5 shadow-xs"
                              : "border-border/60 hover:border-border hover:bg-muted/20"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Circular Avatar */}
                            <div
                              className={cn(
                                "size-10 sm:size-11 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-sm border shrink-0 shadow-2xs",
                                palette
                              )}
                            >
                              {c.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.avatarUrl} alt={c.fullNameFa} className="size-full rounded-full object-cover" />
                              ) : (
                                c.fullNameFa.slice(0, 1)
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#65874f] transition-colors truncate">
                                {c.fullNameFa}
                              </h4>
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                {c.companyNameFa} {c.jobTitleFa ? `• ${c.jobTitleFa}` : ""}
                              </p>
                            </div>
                          </div>

                          {/* Quick Action Icons on End */}
                          <div className="flex items-center gap-1 shrink-0">
                            {c.phoneDirect && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                asChild
                                onClick={(e) => e.stopPropagation()}
                                className="size-7 text-muted-foreground hover:text-[#65874f] rounded-full hidden sm:inline-flex"
                                title={isRtl ? "تماس تلفنی" : "Call"}
                              >
                                <a href={`tel:${c.phoneDirect}`}>
                                  <Phone className="size-3.5" />
                                </a>
                              </Button>
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => handleToggleKey(c.id, e)}
                              className="size-7 text-muted-foreground hover:text-amber-500 rounded-full"
                              title={c.isKeyContact ? (isRtl ? "حذف از برگزیده‌ها" : "Remove favourite") : (isRtl ? "افزودن به برگزیده‌ها" : "Add to favourites")}
                            >
                              <Star className={cn("size-3.5", c.isKeyContact ? "fill-amber-500 text-amber-500" : "")} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating Action Button (FAB) for Adding Contact */}
          <div className="sticky bottom-4 end-4 flex justify-end z-20 pointer-events-none">
            <Button
              type="button"
              onClick={handleStartCreateNew}
              className="size-12 sm:size-13 rounded-full bg-[#65874f] hover:bg-[#547340] text-white shadow-lg flex items-center justify-center p-0 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
              title={isRtl ? "ثبت مخاطب جدید" : "Create new contact"}
            >
              <UserPlus className="size-5 sm:size-6" />
            </Button>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Desktop): Contact Detail / Create Form Card ── */}
        <div className="hidden lg:block w-[380px] xl:w-[420px] shrink-0 sticky top-6">
          {renderRightPanelContent()}
        </div>
      </div>

      {/* ── Mobile Modal Dialog (Matches Right Screen on Small Devices) ── */}
      <Dialog open={isMobileModalOpen} onOpenChange={setIsMobileModalOpen}>
        <DialogContent className="lg:hidden p-0 max-w-[420px] rounded-[28px] overflow-hidden border-border/80">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {isCreatingNew ? (isRtl ? "ثبت مخاطب جدید" : "Create new contact") : selectedContact?.fullNameFa || "Contact"}
            </DialogTitle>
          </DialogHeader>
          {renderRightPanelContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
