// src/modules/customers/components/PhonebookDirectoryView.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronDown,
  User,
  UserPlus,
  UserCheck,
  Phone,
  Mail,
  Building2,
  Camera,
  Copy,
  Check,
  Trash2,
  Pencil,
  X,
  MessageCircle,
  Briefcase,
  Layers,
  Cpu,
  Wrench,
  Factory,
  ShieldCheck,
  ArrowUpRight,
  Flame,
  Award,
  Landmark,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
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
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { IRANIAN_HOLDINGS } from "../data/holdings.data";
import { IRANIAN_PLANTS } from "../data/plants.data";
import { IRANIAN_LICENSORS } from "../data/licensors.data";
import { contactsService, inferContactIndustry } from "../services/contacts.service";
import type { CompanyContact, ContactDepartment, ContactCreateInput, ContactIndustry } from "../types/contacts.types";

const DEPARTMENT_CONFIG: Record<
  ContactDepartment,
  { labelFa: string; labelEn: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  management: {
    labelFa: "مدیریت ارشد",
    labelEn: "Management",
    icon: ShieldCheck,
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

const INDUSTRY_FILTERS: {
  id: "all" | ContactIndustry;
  labelFa: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "all", labelFa: "همه صنایع", labelEn: "All Industries", icon: Building2 },
  { id: "petrochemical", labelFa: "پتروشیمی و پلیمر", labelEn: "Petrochemical", icon: Factory },
  { id: "steel", labelFa: "فولاد و فلزات", labelEn: "Steel & Metallurgy", icon: Layers },
  { id: "refinery", labelFa: "پالایشگاه و نفت", labelEn: "Refinery & Oil", icon: Flame },
  { id: "gas", labelFa: "گاز و انرژی", labelEn: "Gas & Energy", icon: Cpu },
  { id: "licensor", labelFa: "لایسنسورها", labelEn: "Licensors", icon: Award },
  { id: "other", labelFa: "سایر / بدون شرکت", labelEn: "Other / Independent", icon: Briefcase },
];

export const INDUSTRY_TAGS: {
  id: ContactIndustry;
  labelFa: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "petrochemical", labelFa: "پتروشیمی و پلیمر", labelEn: "Petrochemical", icon: Factory },
  { id: "steel", labelFa: "فولاد و فلزات", labelEn: "Steel & Metallurgy", icon: Layers },
  { id: "refinery", labelFa: "پالایشگاه و نفت", labelEn: "Refinery & Oil", icon: Flame },
  { id: "gas", labelFa: "گاز و انرژی", labelEn: "Gas & Energy", icon: Cpu },
  { id: "licensor", labelFa: "لایسنسور و تکنولوژی", labelEn: "Licensor & Tech", icon: Award },
  { id: "other", labelFa: "سایر / بدون شرکت", labelEn: "Other / Independent", icon: Briefcase },
];

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

export interface PhonebookDirectoryViewProps {
  isAdmin?: boolean;
}

export function PhonebookDirectoryView({ isAdmin: propIsAdmin }: PhonebookDirectoryViewProps = {}) {
  const { user } = useAuth();
  const isAdmin = propIsAdmin ?? (user?.role === "superadmin" || user?.role === "admin");

  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();

  const initialCompany = searchParams.get("company") || "all";
  const initialSearch = searchParams.get("q") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedIndustry, setSelectedIndustry] = useState<"all" | ContactIndustry>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Admin Delete Confirmation State
  const [contactToDelete, setContactToDelete] = useState<{ id: string; name: string } | null>(null);

  // Responsive device check: True only for screen width < 1024px
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Active Selected Contact or New Contact Mode
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMoreFieldsOpen, setIsMoreFieldsOpen] = useState(false);

  // Form State
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formFullNameEn, setFormFullNameEn] = useState("");
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formIndustry, setFormIndustry] = useState<ContactIndustry>("petrochemical");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formJobTitleEn, setFormJobTitleEn] = useState("");
  const [formDept, setFormDept] = useState<ContactDepartment>("commercial");
  const [formPhone, setFormPhone] = useState("");
  const [formExtension, setFormExtension] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Company options for Combobox (including holdings, plants, licensors, and custom/no company)
  const companyOptions = useMemo<ComboboxOption[]>(() => {
    const list: ComboboxOption[] = [];

    // Option for independent / without company
    list.push({
      value: "NONE",
      label: isRtl ? "بدون شرکت (مستقل / مشاور)" : "No Company (Independent)",
      triggerLabel: isRtl ? "بدون شرکت (مستقل)" : "No Company (Independent)",
      hint: isRtl ? "مستقل" : "Independent",
      icon: <User className="size-3.5 text-muted-foreground" />,
    });

    const seenNames = new Set<string>();

    // 1. Iranian Holdings
    IRANIAN_HOLDINGS.forEach((h) => {
      if (!seenNames.has(h.nameFa)) {
        seenNames.add(h.nameFa);
        list.push({
          value: h.nameFa,
          label: h.nameFa,
          hint: isRtl ? "هلدینگ" : "Holding",
          icon: <Landmark className="size-3.5 text-primary" />,
          searchTerms: [h.nameFa, h.nameEn || "", h.companyAbbrv || "", h.tseSymbol || ""].filter(Boolean),
        });
      }
    });

    // 2. Plants / Complexes
    IRANIAN_PLANTS.forEach((p) => {
      if (!seenNames.has(p.nameFa)) {
        seenNames.add(p.nameFa);
        list.push({
          value: p.nameFa,
          label: p.nameFa,
          hint: isRtl ? "مجتمع" : "Plant",
          icon: <Factory className="size-3.5 text-emerald-600" />,
          searchTerms: [p.nameFa, p.nameEn || "", p.code || "", p.tseSymbol || ""].filter(Boolean),
        });
      }
    });

    // 3. Licensors
    IRANIAN_LICENSORS.forEach((l) => {
      if (!seenNames.has(l.nameFa)) {
        seenNames.add(l.nameFa);
        list.push({
          value: l.nameFa,
          label: l.nameFa,
          hint: isRtl ? "لایسنسور" : "Licensor",
          icon: <Award className="size-3.5 text-blue-600" />,
          searchTerms: [l.nameFa, l.nameEn || ""],
        });
      }
    });

    // 4. Other Companies from Contacts list
    contacts.forEach((c) => {
      if (
        c.companyNameFa &&
        !c.companyNameFa.includes("بدون شرکت") &&
        !c.companyNameFa.includes("مستقل") &&
        !seenNames.has(c.companyNameFa)
      ) {
        seenNames.add(c.companyNameFa);
        list.push({
          value: c.companyNameFa,
          label: c.companyNameFa,
          hint: isRtl ? "شرکت" : "Company",
          icon: <Building2 className="size-3.5 text-muted-foreground" />,
          searchTerms: [c.companyNameFa, c.companyNameEn || ""],
        });
      }
    });

    return list;
  }, [contacts, isRtl]);

  const handleCompanyChange = (val: string) => {
    if (!val || val === "NONE") {
      setFormCompanyName("");
      setFormIndustry("other");
      return;
    }
    setFormCompanyName(val);
    const inferred = inferContactIndustry({ companyNameFa: val } as CompanyContact);
    if (inferred && inferred !== "other") {
      setFormIndustry(inferred);
    }
  };

  // Load contacts based on filters
  const refreshContacts = () => {
    const list = contactsService.getContacts({
      search,
      company: selectedCompany,
      department: selectedDept,
      industry: selectedIndustry,
    });
    setContacts(list);
  };

  useEffect(() => {
    refreshContacts();
  }, [search, selectedCompany, selectedDept, selectedIndustry]);

  useEffect(() => {
    const companyParam = searchParams.get("company");
    if (companyParam) {
      setSelectedCompany(companyParam);
    }
  }, [searchParams]);

  // Ensure preview always has an active contact on desktop
  useEffect(() => {
    if (!selectedContactId && !isCreatingNew && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    } else if (selectedContactId && !isCreatingNew) {
      const exists = contacts.some((c) => c.id === selectedContactId);
      if (!exists && contacts.length > 0) {
        setSelectedContactId(contacts[0].id);
      }
    } else if (contacts.length === 0 && !isCreatingNew) {
      setIsCreatingNew(true);
    }
  }, [contacts, selectedContactId, isCreatingNew]);

  const selectedContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId) || null;
  }, [contacts, selectedContactId]);

  // Calculate counts per industry
  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: 0,
      petrochemical: 0,
      steel: 0,
      refinery: 0,
      gas: 0,
      licensor: 0,
      other: 0,
    };
    const allFiltered = contactsService.getContacts({ search, company: selectedCompany, department: selectedDept });
    counts.all = allFiltered.length;
    for (const c of allFiltered) {
      const ind = inferContactIndustry(c);
      counts[ind] = (counts[ind] || 0) + 1;
    }
    return counts;
  }, [search, selectedCompany, selectedDept, contacts]);

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

  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    setIsCreatingNew(false);
    setIsEditing(false);
    if (isMobile) {
      setIsMobileModalOpen(true);
    }
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setIsEditing(false);
    setSelectedContactId(null);
    setFormFirstName("");
    setFormLastName("");
    setFormFullNameEn("");
    setFormCompanyName(selectedCompany !== "all" ? selectedCompany : "");
    setFormIndustry(selectedIndustry !== "all" ? selectedIndustry : "petrochemical");
    setFormJobTitle("");
    setFormJobTitleEn("");
    setFormDept("commercial");
    setFormPhone("");
    setFormExtension("");
    setFormMobile("");
    setFormEmail("");
    setFormLocation("");
    setFormNotes("");
    setFormAvatarUrl("");
    setIsMoreFieldsOpen(false);
    if (isMobile) {
      setIsMobileModalOpen(true);
    }
  };

  const handleStartEdit = (contact: CompanyContact) => {
    setIsEditing(true);
    setIsCreatingNew(true);
    const parts = contact.fullNameFa.split(" ");
    setFormFirstName(parts[0] || "");
    setFormLastName(parts.slice(1).join(" ") || "");
    setFormFullNameEn(contact.fullNameEn || "");
    setFormCompanyName(
      contact.companyNameFa === "بدون شرکت (مستقل)" || contact.companyNameFa === "مستقل"
        ? ""
        : contact.companyNameFa
    );
    setFormIndustry(contact.industry || inferContactIndustry(contact) || "other");
    setFormJobTitle(contact.jobTitleFa);
    setFormJobTitleEn(contact.jobTitleEn || "");
    setFormDept(contact.department);
    setFormPhone(contact.phoneDirect || "");
    setFormExtension(contact.phoneExtension || "");
    setFormMobile(contact.mobilePhone || "");
    setFormEmail(contact.email || "");
    setFormLocation(contact.locationFa || "");
    setFormNotes(contact.notesFa || "");
    setFormAvatarUrl(contact.avatarUrl || "");
    setIsMoreFieldsOpen(true);
    if (isMobile) {
      setIsMobileModalOpen(true);
    }
  };

  const handleSaveContact = (e?: React.FormEvent) => {
    e?.preventDefault();
    const fullName = `${formFirstName} ${formLastName}`.trim();
    if (!fullName) {
      toast.error(isRtl ? "لطفاً نام مخاطب را وارد کنید." : "Please enter contact name.");
      return;
    }

    const companyName = formCompanyName.trim() || (isRtl ? "بدون شرکت (مستقل)" : "Independent");

    setIsSaving(true);
    try {
      const deptConf = DEPARTMENT_CONFIG[formDept] || DEPARTMENT_CONFIG.other;
      const currentUserName = user?.fullNameFa || user?.fullName || user?.name || (isRtl ? "کاربر جاری" : "Current User");
      const currentUserId = user?.id || "usr-current";
      const currentUserAvatar = user?.avatar || user?.imageUrl;

      if (isEditing && selectedContactId) {
        contactsService.updateContact(selectedContactId, {
          fullNameFa: fullName,
          fullNameEn: formFullNameEn.trim() || undefined,
          companyNameFa: companyName,
          industry: formIndustry,
          jobTitleFa: formJobTitle.trim() || (isRtl ? "کارشناس" : "Specialist"),
          jobTitleEn: formJobTitleEn.trim() || undefined,
          department: formDept,
          departmentTitleFa: deptConf.labelFa,
          phoneDirect: formPhone.trim() || undefined,
          phoneExtension: formExtension.trim() || undefined,
          mobilePhone: formMobile.trim() || undefined,
          email: formEmail.trim() || undefined,
          locationFa: formLocation.trim() || undefined,
          notesFa: formNotes.trim() || undefined,
          avatarUrl: formAvatarUrl || undefined,
        });
        toast.success(isRtl ? "اطلاعات مخاطب به‌روزرسانی شد." : "Contact updated successfully.");
      } else {
        const input: ContactCreateInput = {
          fullNameFa: fullName,
          fullNameEn: formFullNameEn.trim() || undefined,
          companyNameFa: companyName,
          industry: formIndustry,
          jobTitleFa: formJobTitle.trim() || (isRtl ? "کارشناس" : "Specialist"),
          jobTitleEn: formJobTitleEn.trim() || undefined,
          department: formDept,
          departmentTitleFa: deptConf.labelFa,
          phoneDirect: formPhone.trim() || undefined,
          phoneExtension: formExtension.trim() || undefined,
          mobilePhone: formMobile.trim() || undefined,
          email: formEmail.trim() || undefined,
          locationFa: formLocation.trim() || undefined,
          notesFa: formNotes.trim() || undefined,
          createdByUserId: currentUserId,
          createdByUserName: currentUserName,
          createdByUserAvatar: currentUserAvatar,
        };

        const created = contactsService.addContact(input);
        setSelectedContactId(created.id);
        toast.success(
          isRtl
            ? `مخاطب به نام شما («${currentUserName}») با موفقیت ذخیره و تأیید شد.`
            : `Contact saved and approved under your name («${currentUserName}»).`
        );
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

  const handlePromptDelete = (id: string, name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isAdmin) {
      toast.error(isRtl ? "تنها مدیران سیستم مجاز به حذف مخاطب هستند." : "Only administrators can delete contacts.");
      return;
    }
    setContactToDelete({ id, name });
  };

  const handleConfirmDelete = () => {
    if (!contactToDelete) return;
    contactsService.deleteContact(contactToDelete.id);
    toast.success(isRtl ? "مخاطب با موفقیت حذف شد." : "Contact deleted.");
    if (selectedContactId === contactToDelete.id) {
      setSelectedContactId(null);
    }
    setIsMobileModalOpen(false);
    setContactToDelete(null);
    refreshContacts();
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

  // ── Render Right Panel Content (Form or Selected Contact) ──
  const renderRightPanelContent = () => {
    if (isCreatingNew) {
      return (
        <div className="w-full flex flex-col max-h-[calc(100vh-var(--header-height,64px)-2rem)] bg-card rounded-[24px] border border-border/80 shadow-md overflow-hidden animate-in fade-in duration-150">
          {/* Top Bar - pinned */}
          <div className="px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border/60 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreatingNew(false);
                  setIsEditing(false);
                  setIsMobileModalOpen(false);
                  if (contacts.length > 0) {
                    setSelectedContactId(contacts[0].id);
                  }
                }}
                className="text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                title={isRtl ? "بازگشت" : "Back"}
              >
                <ChevronLeft className={cn("size-4", isRtl && "rotate-180")} />
              </Button>

              <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                {isEditing
                  ? isRtl
                    ? "ویرایش اطلاعات مخاطب"
                    : "Edit contact"
                  : isRtl
                  ? "ایجاد مخاطب جدید"
                  : "Create new contact"}
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveContact}
              disabled={isSaving}
              className="text-primary hover:text-primary/80 font-bold text-xs sm:text-sm h-8 px-2 cursor-pointer hover:bg-transparent"
            >
              {isSaving ? (isRtl ? "در حال ذخیره..." : "saving...") : isRtl ? "ذخیره" : "save"}
            </Button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 space-y-0 scrollbar-thin">
            <form onSubmit={handleSaveContact} className="p-0 space-y-0">
              {/* Primary Hero Banner with Avatar */}
              <div className="bg-primary text-primary-foreground p-5 pb-10 flex flex-col items-center justify-center relative shadow-inner">
                <div className="relative group">
                  <div className="size-20 sm:size-22 rounded-full border-3 border-white/80 flex items-center justify-center bg-white/10 text-white shadow-md overflow-hidden">
                    {formAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formAvatarUrl} alt="Avatar" className="size-full object-cover" />
                    ) : (
                      <User className="size-12 text-white/90" strokeWidth={1.5} />
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
                    className="size-7 rounded-full bg-white dark:bg-card text-foreground shadow-md absolute bottom-0 end-0 p-0 border border-border/80 hover:bg-muted cursor-pointer hover:scale-105 transition-transform"
                    title={isRtl ? "بارگذاری عکس مخاطب" : "Upload photo"}
                  >
                    <Camera className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Floating Card 1: Company Selector & Industry Tag */}
              <div className="-mt-6 mx-3.5 sm:mx-4 rounded-2xl bg-card border border-border/80 shadow-xs p-3.5 sm:p-4 space-y-3 relative z-10">
                {/* Creator Attribution Notice */}
                {!isEditing && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
                    <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-bold block text-[11px] sm:text-xs">
                        {isRtl ? "ثبت رسمی به نام شما:" : "Registered under your name:"}
                      </span>
                      <span className="text-[10.5px] opacity-90 block mt-0.5 leading-relaxed">
                        {isRtl
                          ? `این مخاطب پس از ذخیره، با نام شما («${user?.fullNameFa || user?.fullName || user?.name || "کاربر جاری"}») به عنوان ثبت‌کننده تأیید و برچسب‌گذاری می‌شود.`
                          : `This contact will be saved, verified, and tagged as created by «${user?.fullNameFa || user?.fullName || user?.name || "Current User"}».`}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                        {isRtl ? "شرکت یا مجتمع صنعتی:" : "Company / Complex:"}
                      </span>
                      {formCompanyName && (
                        <button
                          type="button"
                          onClick={() => handleCompanyChange("NONE")}
                          className="text-[10px] text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                        >
                          {isRtl ? "ثبت بدون شرکت" : "Clear (No Company)"}
                        </button>
                      )}
                    </div>

                    <Combobox
                      options={companyOptions}
                      value={formCompanyName || "NONE"}
                      onChange={handleCompanyChange}
                      placeholder={isRtl ? "انتخاب یا تایپ شرکت جدید..." : "Select or type new company..."}
                      searchPlaceholder={isRtl ? "جستجو یا تایپ شرکت جدید..." : "Search or type new..."}
                      emptyText={isRtl ? "شرکتی یافت نشد. برای ثبت تایپ کنید." : "No company found. Type to create."}
                      creatable={true}
                      allowClear={true}
                      size="sm"
                      className="w-full text-xs sm:text-sm font-semibold rounded-xl bg-background border-border/70 shadow-none focus:border-primary h-9"
                    />
                  </div>
                </div>

                {/* Industry Tag Selector */}
                <div className="pt-2.5 border-t border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground">
                      {isRtl ? "تگ صنعت / دسته‌بندی:" : "Industry Tag:"}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0.5 px-2.5 border-primary/30 text-primary font-medium rounded-full">
                      {INDUSTRY_TAGS.find((t) => t.id === formIndustry)?.labelFa || (isRtl ? "سایر" : "Other")}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {INDUSTRY_TAGS.map((tag) => {
                      const isSelected = formIndustry === tag.id;
                      const Icon = tag.icon;
                      return (
                        <Button
                          key={tag.id}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="xs"
                          onClick={() => setFormIndustry(tag.id)}
                          className={cn(
                            "h-6.5 sm:h-7 px-2.5 sm:px-3 rounded-full text-[11px] font-medium transition-all gap-1.5 cursor-pointer",
                            isSelected
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs border-primary"
                              : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <Icon className="size-3" />
                          <span>{isRtl ? tag.labelFa : tag.labelEn}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Floating Card 2: Contact Form Inputs */}
              <div className="mt-3 mx-3.5 sm:mx-4 mb-4 rounded-2xl bg-card border border-border/80 shadow-xs p-3.5 sm:p-4 space-y-4">
                {/* Person Section */}
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="size-5" />
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    {/* Persian Name */}
                    <div className="space-y-1.5">
                      <Label className="text-[10.5px] sm:text-xs font-semibold text-foreground">
                        {isRtl ? "نام و نام خانوادگی به فارسی:" : "Name in Persian:"}
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          value={formFirstName}
                          onChange={(e) => setFormFirstName(e.target.value)}
                          placeholder={isRtl ? "نام کوچک (فارسی)" : "First name"}
                          className="h-9 text-xs sm:text-sm rounded-xl bg-background border-border/70 focus-visible:border-primary"
                          required
                        />
                        <Input
                          value={formLastName}
                          onChange={(e) => setFormLastName(e.target.value)}
                          placeholder={isRtl ? "نام خانوادگی (فارسی)" : "Last name"}
                          className="h-9 text-xs sm:text-sm rounded-xl bg-background border-border/70 focus-visible:border-primary"
                        />
                      </div>
                    </div>

                    {/* English Name */}
                    <div className="space-y-1.5">
                      <Label className="text-[10.5px] sm:text-xs font-semibold text-foreground">
                        {isRtl ? "نام و نام خانوادگی به انگلیسی (English Full Name):" : "Full Name in English:"}
                      </Label>
                      <Input
                        value={formFullNameEn}
                        onChange={(e) => setFormFullNameEn(e.target.value)}
                        placeholder="e.g. Dr. Reza Alizadeh"
                        dir="ltr"
                        className="h-9 text-xs sm:text-sm rounded-xl bg-background border-border/70 font-sans focus-visible:border-primary"
                      />
                    </div>

                    {/* Job Title */}
                    <div className="space-y-1.5">
                      <Label className="text-[10.5px] sm:text-xs font-semibold text-foreground">
                        {isRtl ? "سمت سازمانی:" : "Job Title:"}
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          value={formJobTitle}
                          onChange={(e) => setFormJobTitle(e.target.value)}
                          placeholder={isRtl ? "سمت به فارسی" : "Job title (Fa)"}
                          className="h-9 text-xs sm:text-sm rounded-xl bg-background border-border/70 focus-visible:border-primary"
                        />
                        <Input
                          value={formJobTitleEn}
                          onChange={(e) => setFormJobTitleEn(e.target.value)}
                          placeholder={isRtl ? "سمت به انگلیسی" : "Job title (En)"}
                          dir="ltr"
                          className="h-9 text-xs sm:text-sm rounded-xl bg-background border-border/70 font-sans focus-visible:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Section */}
                <div className="flex items-start gap-3 pt-2.5 border-t border-border/40">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="size-5" />
                  </div>
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground">
                          {isRtl ? "تلفن مستقیم:" : "Direct Phone:"}
                        </Label>
                        <Input
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="021-88880000"
                          dir="ltr"
                          className="h-9 text-xs sm:text-sm rounded-xl bg-background border-border/70 font-mono focus-visible:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground">
                          {isRtl ? "داخلی:" : "Ext:"}
                        </Label>
                        <Input
                          value={formExtension}
                          onChange={(e) => setFormExtension(e.target.value)}
                          placeholder="123"
                          dir="ltr"
                          className="h-9 text-xs sm:text-sm rounded-xl bg-background border-border/70 font-mono focus-visible:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground">
                        {isRtl ? "شماره همراه (موبایل):" : "Mobile Phone:"}
                      </Label>
                      <Input
                        value={formMobile}
                        onChange={(e) => setFormMobile(e.target.value)}
                        placeholder="09121234567"
                        dir="ltr"
                        className="h-9 text-xs sm:text-sm rounded-xl bg-background border-border/70 font-mono focus-visible:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Mail & Office Location Section */}
                <div className="flex items-start gap-3 pt-2.5 border-t border-border/40">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="size-5" />
                  </div>
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground">
                        {isRtl ? "پست الکترونیکی:" : "Email Address:"}
                      </Label>
                      <Input
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="name@company.ir"
                        dir="ltr"
                        type="email"
                        className="h-9 text-xs sm:text-sm rounded-xl bg-background border-border/70 font-sans focus-visible:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground">
                        {isRtl ? "موقعیت / دفتر کار:" : "Office / Site Location:"}
                      </Label>
                      <Input
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder={isRtl ? "مثلاً: تهران، دفتر مرکزی" : "e.g. Tehran, Central Office"}
                        className="h-9 text-xs sm:text-sm rounded-xl bg-background border-border/70 focus-visible:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* MORE FIELDS Button & Accordion */}
                <div className="pt-2 border-t border-border/40">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsMoreFieldsOpen(!isMoreFieldsOpen)}
                    className="w-full text-primary hover:text-primary/80 font-bold text-xs uppercase tracking-wider hover:bg-muted/40 h-8 gap-1 cursor-pointer rounded-xl"
                  >
                    <span>{isRtl ? "فیلدهای بیشتر و واحد سازمانی" : "MORE FIELDS"}</span>
                    <ChevronDown className={cn("size-3.5 transition-transform", isMoreFieldsOpen && "rotate-180")} />
                  </Button>

                  {isMoreFieldsOpen && (
                    <div className="mt-2.5 p-3 sm:p-3.5 rounded-xl bg-muted/20 border border-border/70 space-y-3 animate-in fade-in duration-150">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold">{isRtl ? "واحد / دپارتمان سازمانی:" : "Department:"}</Label>
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
                                className="h-7 text-[11px] justify-start gap-1.5 px-2 rounded-lg"
                              >
                                <Icon className="size-3" />
                                <span className="truncate">{isRtl ? conf.labelFa : conf.labelEn}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold">{isRtl ? "توضیحات و سوابق همکاری:" : "Notes:"}</Label>
                        <Textarea
                          value={formNotes}
                          onChange={(e) => setFormNotes(e.target.value)}
                          placeholder={isRtl ? "یادداشت‌های مرتبط با پروژه‌ها و پیگیری‌ها..." : "Project notes..."}
                          className="text-xs min-h-[70px] rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (selectedContact) {
      const deptConf = DEPARTMENT_CONFIG[selectedContact.department] || DEPARTMENT_CONFIG.other;
      const DeptIcon = deptConf.icon;

      return (
        <div className="w-full flex flex-col max-h-[calc(100vh-var(--header-height,64px)-2rem)] bg-card rounded-[24px] border border-border/80 shadow-md overflow-hidden animate-in fade-in duration-150">
          {/* Top Bar - pinned */}
          <div className="px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border/60 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[170px]">
                {selectedContact.fullNameFa}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isAdmin && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handlePromptDelete(selectedContact.id, selectedContact.fullNameFa)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                  title={isRtl ? "حذف مخاطب (مخصوص ادمین)" : "Delete contact (Admin only)"}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => handleStartEdit(selectedContact)}
                className="text-muted-foreground hover:text-primary rounded-lg cursor-pointer"
                title={isRtl ? "ویرایش" : "Edit"}
              >
                <Pencil className="size-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleStartCreateNew}
                className="size-7 rounded-lg text-primary hover:bg-primary/10 cursor-pointer"
                title={isRtl ? "ثبت مخاطب جدید" : "Create new"}
              >
                <UserPlus className="size-4" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 space-y-0 scrollbar-thin">
            {/* Primary Hero Banner with Avatar */}
            <div className="bg-primary text-primary-foreground p-6 pb-12 flex flex-col items-center justify-center relative shadow-inner text-center">
              <div className="size-20 sm:size-24 rounded-full border-3 border-white/80 flex items-center justify-center bg-white/10 text-white shadow-md overflow-hidden">
                {selectedContact.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedContact.avatarUrl} alt={selectedContact.fullNameFa} className="size-full object-cover" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-bold font-sans">
                    {selectedContact.fullNameFa.slice(0, 1)}
                  </div>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mt-3 leading-snug">
                {selectedContact.fullNameFa}
              </h3>
              {selectedContact.fullNameEn && (
                <p className="text-xs sm:text-sm font-semibold text-white/90 font-sans tracking-wide mt-0.5">
                  {selectedContact.fullNameEn}
                </p>
              )}
              <p className="text-xs sm:text-sm text-white/80 font-medium mt-1">
                {selectedContact.jobTitleFa}
                {selectedContact.jobTitleEn ? ` • ${selectedContact.jobTitleEn}` : ""}
              </p>
            </div>

            {/* Floating Card 1: Company Profile with Link & Industry Tag */}
            <div className="-mt-6 mx-3.5 sm:mx-4 rounded-2xl bg-card border border-border/80 shadow-xs p-3.5 sm:p-4 space-y-3 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                      {isRtl ? "شرکت و مجتمع تابعه:" : "Company / Complex"}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-foreground truncate block">
                      {selectedContact.companyNameFa || (isRtl ? "بدون شرکت (مستقل)" : "Independent")}
                    </span>
                  </div>
                </div>

                {selectedContact.companyNameFa &&
                  !selectedContact.companyNameFa.includes("بدون شرکت") &&
                  !selectedContact.companyNameFa.includes("مستقل") && (
                    <Link
                      href={`/customers?search=${encodeURIComponent(selectedContact.companyNameFa)}`}
                      className="p-1.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors shrink-0"
                      title={isRtl ? "مشاهده پرونده شرکت در بخش کارفرمایان" : "View Company"}
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  )}
              </div>

              {/* Industry Tag & Department Badges */}
              <div className="pt-2.5 border-t border-border/40 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">{isRtl ? "صنعت:" : "Industry:"}</span>
                  <Badge variant="outline" className="text-xs py-0.5 px-3 rounded-full border-primary/30 text-primary font-semibold">
                    {INDUSTRY_TAGS.find((t) => t.id === (selectedContact.industry || inferContactIndustry(selectedContact)))?.labelFa || (isRtl ? "سایر" : "Other")}
                  </Badge>
                </div>

                <Badge variant="secondary" className="text-xs py-0.5 px-3 rounded-full font-medium gap-1.5">
                  <DeptIcon className="size-3 text-primary" />
                  <span>{isRtl ? deptConf.labelFa : deptConf.labelEn}</span>
                </Badge>
              </div>

              {/* Creator Attribution Tag */}
              {selectedContact.createdByUserName && (
                <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="text-[10.5px] text-muted-foreground font-medium flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-emerald-500" />
                    <span>{isRtl ? "ثبت و تأییدکننده اطلاعات:" : "Added & Verified by:"}</span>
                  </span>
                  <Badge variant="secondary" className="text-xs py-0.5 px-2.5 font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 gap-1 rounded-full">
                    <Check className="size-3 text-emerald-600" />
                    <span>{selectedContact.createdByUserName}</span>
                  </Badge>
                </div>
              )}
            </div>

            {/* Floating Card 2: Contact Information Details */}
            <div className="mt-3 mx-3.5 sm:mx-4 mb-4 rounded-2xl bg-card border border-border/80 shadow-xs p-3.5 sm:p-4 space-y-3.5">
              {/* Direct Phone */}
              {selectedContact.phoneDirect && (
                <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Phone className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block">{isRtl ? "تلفن مستقیم" : "Direct Phone"}</span>
                      <a
                        href={`tel:${selectedContact.phoneDirect}`}
                        dir="ltr"
                        className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary font-mono truncate block"
                      >
                        {selectedContact.phoneDirect}
                        {selectedContact.phoneExtension ? ` (${selectedContact.phoneExtension})` : ""}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => handleCopy(selectedContact.phoneDirect || "", "p-dir", e)}
                      className="size-7 text-muted-foreground hover:text-foreground rounded-lg"
                      title={isRtl ? "کپی شماره" : "Copy"}
                    >
                      {copiedField === "p-dir" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      asChild
                      className="h-7 px-2 text-xs gap-1 border-border/60 hover:bg-primary/10 hover:text-primary rounded-lg"
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
                <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MessageCircle className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block">{isRtl ? "شماره همراه (موبایل)" : "Mobile"}</span>
                      <a
                        href={`tel:${selectedContact.mobilePhone}`}
                        dir="ltr"
                        className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary font-mono truncate block"
                      >
                        {selectedContact.mobilePhone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => handleCopy(selectedContact.mobilePhone || "", "p-mob", e)}
                      className="size-7 text-muted-foreground hover:text-foreground rounded-lg"
                      title={isRtl ? "کپی شماره" : "Copy"}
                    >
                      {copiedField === "p-mob" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      asChild
                      className="h-7 px-2 text-xs gap-1 border-border/60 hover:bg-emerald-500/10 hover:text-emerald-600 rounded-lg"
                    >
                      <a
                        href={`https://wa.me/${selectedContact.mobilePhone.replace(/[^0-9]/g, "").replace(/^0/, "98")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="size-3" />
                        <span>{isRtl ? "واتس‌اپ" : "WhatsApp"}</span>
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Email */}
              {selectedContact.email && (
                <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Mail className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block">{isRtl ? "ایمیل سازمانی" : "Email"}</span>
                      <a
                        href={`mailto:${selectedContact.email}`}
                        dir="ltr"
                        className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary truncate block font-sans"
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
                    className="size-7 text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
                    title={isRtl ? "کپی ایمیل" : "Copy"}
                  >
                    {copiedField === "p-mail" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
              )}

              {/* Department & Location */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="p-2.5 rounded-xl bg-muted/15 border border-border/40">
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground block font-medium">{isRtl ? "دپارتمان:" : "Department:"}</span>
                  <Badge variant="outline" className={cn("text-xs mt-1 gap-1 border py-0.5 px-2 rounded-lg", deptConf.color)}>
                    <DeptIcon className="size-3" />
                    <span className="truncate">{isRtl ? deptConf.labelFa : deptConf.labelEn}</span>
                  </Badge>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/15 border border-border/40">
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground block font-medium">{isRtl ? "موقعیت:" : "Location:"}</span>
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate block mt-1">
                    {selectedContact.locationFa || (isRtl ? "دفتر مرکزی" : "Headquarters")}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedContact.notesFa && (
                <div className="p-3 rounded-xl bg-muted/15 border border-border/40 space-y-1.5">
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold block">{isRtl ? "یادداشت‌ها و سوابق:" : "Notes:"}</span>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {selectedContact.notesFa}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions Bar - pinned */}
          <div className="p-3 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleStartCreateNew}
              className="rounded-xl text-xs gap-1 border-primary/40 hover:bg-primary/10 text-primary h-7 px-2.5 font-semibold"
            >
              <UserPlus className="size-3.5" />
              <span>{isRtl ? "مخاطب جدید" : "New Contact"}</span>
            </Button>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleStartEdit(selectedContact)}
                className="rounded-xl text-xs gap-1 h-7 px-2"
              >
                <Pencil className="size-3" />
                <span>{isRtl ? "ویرایش" : "Edit"}</span>
              </Button>

              {isAdmin && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handlePromptDelete(selectedContact.id, selectedContact.fullNameFa)}
                  className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-7 cursor-pointer"
                  title={isRtl ? "حذف مخاطب (مخصوص ادمین)" : "Delete contact (Admin only)"}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-80 rounded-[24px] border border-dashed border-border bg-card flex flex-col items-center justify-center p-6 text-center text-muted-foreground gap-3 animate-in fade-in duration-150">
        <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <UserPlus className="size-7" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">
            {isRtl ? "دفترچه تلفن آماده ثبت مخاطب است" : "Phonebook Ready"}
          </h4>
          <p className="text-xs text-muted-foreground max-w-[240px]">
            {isRtl ? "برای ثبت مخاطب روی دکمه زیر کلیک کنید." : "Click below to add a contact."}
          </p>
        </div>
        <Button
          type="button"
          onClick={handleStartCreateNew}
          className="rounded-xl text-xs gap-1.5 h-8 px-3 font-semibold mt-1"
        >
          <UserPlus className="size-3.5" />
          <span>{isRtl ? "ثبت مخاطب جدید" : "Add New Contact"}</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full space-y-4">
      {/* ── Main Two-Column Layout (Master-Detail with Persistent Sticky Preview) ── */}
      <div className="flex flex-col lg:flex-row items-start gap-4 xl:gap-6 w-full min-w-0">
        {/* ── LEFT COLUMN: Contact List ── */}
        <div className="flex-1 min-w-0 w-full space-y-3.5">
          {/* 1. Top Search Bar (White background, without microphone) */}
          <div className="flex items-center gap-2 p-1.5 ps-3 pe-2 rounded-2xl bg-white dark:bg-card border border-border/80 shadow-xs">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? "جستجوی مخاطبین (نام، شرکت، سمت، تلفن، ایمیل)..." : "Search contacts"}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="size-8 text-muted-foreground hover:text-foreground rounded-full cursor-pointer"
                  title={isRtl ? "فیلتر واحد سازمانی" : "Filter by department"}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
                  {isRtl ? "فیلتر بر اساس دپارتمان:" : "Filter by department:"}
                </div>
                {(Object.keys(DEPARTMENT_CONFIG) as ContactDepartment[]).map((dKey) => {
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
                    setSelectedIndustry("all");
                  }}
                  className="text-xs cursor-pointer text-muted-foreground"
                >
                  {isRtl ? "پاک‌سازی همه فیلترها" : "Clear all filters"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 2. Top Industry Filter Pills (All visible with wrap, primary theme) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            {INDUSTRY_FILTERS.map((ind) => {
              const isSelected = selectedIndustry === ind.id;
              const Icon = ind.icon;
              const count = industryCounts[ind.id] || 0;

              return (
                <Button
                  key={ind.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="xs"
                  onClick={() => setSelectedIndustry(ind.id)}
                  className={cn(
                    "h-7 px-2.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 tabular-nums cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-xs"
                      : "bg-white dark:bg-card text-foreground/80 border-border/80 hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <Icon className="size-3 shrink-0" />
                  <span>{isRtl ? ind.labelFa : ind.labelEn}</span>
                  <span
                    className={cn(
                      "text-[10px] font-normal px-1 rounded-full",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {formatLocaleNumber(count, isRtl)}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* 3. Alphabetical Contact List */}
          {contacts.length === 0 ? (
            <div className="p-10 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
              <User className="size-10 mx-auto text-muted-foreground/40" />
              <h3 className="text-xs sm:text-sm font-bold text-foreground">
                {isRtl ? "مخاطبی در این حوزه یافت نشد" : "No contacts found"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {isRtl
                  ? "فیلتر صنعت دیگری را انتخاب کنید یا از دکمه زیر برای ایجاد مخاطب جدید استفاده فرمایید."
                  : "Select a different industry filter or click below to create a contact."}
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
            <div className="space-y-3.5 pt-1">
              {alphabeticalGroups.map((group) => (
                <div key={group.letter} className="flex items-start gap-2.5 sm:gap-3.5">
                  {/* Alphabet Letter on Side Margin */}
                  <div className="w-5 sm:w-6 pt-2 text-start shrink-0">
                    <span className="text-sm font-bold text-muted-foreground/75 font-sans sticky top-2">
                      {group.letter}
                    </span>
                  </div>

                  {/* Contacts under this letter */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    {group.contacts.map((c) => {
                      const palette = getAvatarPalette(c.id);
                      const isSelected = selectedContactId === c.id && !isCreatingNew;

                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectContact(c.id)}
                          className={cn(
                            "flex items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer bg-card group",
                            isSelected
                              ? "border-primary ring-2 ring-primary/25 bg-primary/5 shadow-xs"
                              : "border-border/60 hover:border-border hover:bg-muted/20"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Circular Avatar */}
                            <div
                              className={cn(
                                "size-9 sm:size-10 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-xs sm:text-sm border shrink-0 shadow-2xs",
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
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                  {c.fullNameFa}
                                </h4>
                                {c.fullNameEn && (
                                  <span className="text-[11px] text-muted-foreground font-sans font-medium hidden sm:inline truncate max-w-[150px]">
                                    ({c.fullNameEn})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                <p className="text-[10.5px] text-muted-foreground truncate">
                                  {c.companyNameFa} {c.jobTitleFa ? `• ${c.jobTitleFa}` : ""}
                                </p>
                                {c.createdByUserName && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9.5px] py-0 px-1.5 gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium rounded-md bg-emerald-500/5 shrink-0"
                                  >
                                    <UserCheck className="size-2.5" />
                                    <span>{isRtl ? `ثبت: ${c.createdByUserName}` : `By: ${c.createdByUserName}`}</span>
                                  </Badge>
                                )}
                              </div>
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
                                className="size-7 text-muted-foreground hover:text-primary rounded-full hidden sm:inline-flex"
                                title={isRtl ? "تماس تلفنی" : "Call"}
                              >
                                <a href={`tel:${c.phoneDirect}`}>
                                  <Phone className="size-3.5" />
                                </a>
                              </Button>
                            )}

                            {isAdmin && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => handlePromptDelete(c.id, c.fullNameFa, e)}
                                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full cursor-pointer transition-colors"
                                title={isRtl ? "حذف مخاطب (مخصوص ادمین)" : "Delete contact (Admin only)"}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
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
              className="size-11 sm:size-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center p-0 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
              title={isRtl ? "ثبت مخاطب جدید" : "Create new contact"}
            >
              <UserPlus className="size-5" />
            </Button>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Desktop): Contact Detail / Create Form Card (ALWAYS PRESENT & STICKY BELOW HEADER) ── */}
        <div className="hidden lg:block w-[440px] xl:w-[480px] 2xl:w-[520px] shrink-0 sticky top-[calc(var(--header-height,64px)+0.75rem)] self-start max-w-full z-20">
          {renderRightPanelContent()}
        </div>
      </div>

      {/* ── Mobile Modal Dialog (ONLY rendered and mounted on small screens < 1024px) ── */}
      {isMobile && (
        <Dialog open={isMobileModalOpen} onOpenChange={setIsMobileModalOpen}>
          <DialogContent className="p-0 max-w-[480px] w-[95vw] max-h-[90vh] rounded-[24px] overflow-hidden flex flex-col border border-border/80">
            <DialogHeader className="sr-only">
              <DialogTitle>
                {isCreatingNew ? (isRtl ? "ثبت مخاطب جدید" : "Create new contact") : selectedContact?.fullNameFa || "Contact"}
              </DialogTitle>
            </DialogHeader>
            {renderRightPanelContent()}
          </DialogContent>
        </Dialog>
      )}

      {/* ── Admin Delete Confirmation Dialog ── */}
      <Dialog open={Boolean(contactToDelete)} onOpenChange={(open) => !open && setContactToDelete(null)}>
        <DialogContent className="max-w-md rounded-2xl p-5 border border-border/80 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <div className="size-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="size-4" />
              </div>
              <span>{isRtl ? "تأیید حذف مخاطب" : "Confirm Contact Deletion"}</span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2">
            {isRtl
              ? `آیا از حذف مخاطب «${contactToDelete?.name}» از دفترچه تلفن اطمینان دارید؟ این عملیات قابل بازگشت نیست.`
              : `Are you sure you want to delete "${contactToDelete?.name}" from the phonebook? This action cannot be undone.`}
          </p>
          <div className="flex items-center justify-end gap-2.5 mt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setContactToDelete(null)}
              className="rounded-xl text-xs cursor-pointer"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              className="rounded-xl text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              <Trash2 className="size-3.5" />
              <span>{isRtl ? "حذف مخاطب" : "Delete"}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
