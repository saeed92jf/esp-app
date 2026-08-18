"use client";

import React, { memo, useState, useRef } from "react";
import { Position, type NodeProps, type Node } from "@xyflow/react";
import {
  Trash2,
  FolderOpen,
  Mail,
  Phone,
  AlertCircle,
  Plus,
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
} from "lucide-react";

import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/esp-flow/types";

import { COUNTRIES, getCountryByCode, validatePhone, validateMobile, cleanRawPhone, applyMask } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useLocale } from "next-intl";
import { Combobox } from "@/components/ui/combobox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
  VesselFieldLabel,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

export interface ProjectItem {
  id: string;
  equipmentType?: string;
  tagNo: string;
  qty: number;
  description?: string;
}

export interface ProjectData {
  indentNumber?: string;
  date?: string;
  dateIsJalali?: boolean;
  quotationNo?: string;
  rev?: string;
  customer?: string;
  endUser?: string;
  plantProduction?: string;
  projectTitle?: string;
  projectLink?: string;
  gender?: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  equipmentType?: string;
  tagNo?: string;
  qty?: number;
  uploadDocuments?: string;
  description?: string;
  items?: ProjectItem[];
}

const CUSTOMER_OPTIONS = [{ value: "cust_01", label: "Sample Customer A" }];
const END_USER_OPTIONS = [{ value: "eu_01", label: "Sample End User A" }];
const PLANT_OPTIONS = [{ value: "plant_01", label: "Sample Plant A" }];

function generateItemId(): string {
  if (typeof window !== "undefined" && window.crypto && typeof window.crypto.randomUUID === "function") {
    try {
      return window.crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function ProjectDatePicker({
  value,
  onChange,
  isJalali,
  onToggleCalendar,
  placeholder,
}: {
  value?: string;
  onChange: (v: string) => void;
  isJalali: boolean;
  onToggleCalendar: (newVal: boolean) => void;
  placeholder?: string;
}) {
  const dateObj = React.useMemo(() => (value ? new Date(value) : undefined), [value]);

  const handleSelect = (d?: Date) => {
    onChange(d ? d.toISOString() : "");
  };

  return (
    <div className="w-full min-w-0 flex items-center h-7 rounded-lg transition-colors border-input hover:border-form-primary focus-within:border-form-primary">
      <DatePicker
        value={dateObj}
        onChange={handleSelect}
        placeholder={placeholder || "Select date"}
        isJalali={isJalali}
        onCalendarTypeChange={onToggleCalendar}
        size="sm"
        triggerClassName="h-7 text-xs w-full min-w-0 bg-white dark:bg-black rounded-lg border border-input focus-within:border-form-primary hover:border-form-primary shadow-none px-2 text-foreground"
      />
    </div>
  );
}

function EmailField({
  value,
  onChange,
  errorText,
}: {
  value: string;
  onChange: (v: string) => void;
  errorText: string;
}) {
  const [touched, setTouched] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasValue = Boolean(value && value.trim().length > 0);
  const isValid = hasValue && emailRegex.test(value.trim());
  const isInvalid = touched && hasValue && !isValid;

  return (
    <div className="space-y-0.5 w-full min-w-0">
      <div
        className={`relative flex items-center h-7 w-full min-w-0 rounded-lg border bg-white dark:bg-black px-2 gap-1.5 transition-colors ${
          isInvalid
            ? "border-destructive ring-1 ring-destructive"
            : "border-input focus-within:border-form-primary"
        }`}
      >
        <Mail className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="contact@company.com"
          className="h-full text-xs flex-1 min-w-0 bg-transparent border-0 outline-none placeholder:text-muted-foreground text-foreground"
        />
        {isValid && (
          <CheckCircle2 className="size-3.5 shrink-0 text-form-primary" />
        )}
      </div>
      {isInvalid && (
        <div className="text-[10px] text-destructive flex items-center gap-1 font-medium px-1">
          <AlertCircle className="size-3 shrink-0" />
          {errorText}
        </div>
      )}
    </div>
  );
}

function PhoneField({
  value,
  onChange,
  placeholder,
  errorText,
  isMobile = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  errorText: string;
  isMobile?: boolean;
}) {
  const locale = useLocale();
  const isFa = locale === "fa";
  const [touched, setTouched] = useState(false);
  const hasValue = Boolean(value && value.trim().length > 0);
  
  const [countryCode, setCountryCode] = useState("IR");
  const [phoneRaw, setPhoneRaw] = useState(value);
  
  React.useEffect(() => {
    if (value && value.includes(" ")) {
      const parts = value.split(" ");
      const maybeDialCode = parts[0];
      const matchedCountry = COUNTRIES.find(c => c.dialCode === maybeDialCode);
      if (matchedCountry) {
        setCountryCode(matchedCountry.code);
        const rawPart = parts.slice(1).join(" ");
        const maskToUse = isMobile && matchedCountry.mobileMask ? matchedCountry.mobileMask : matchedCountry.mask;
        setPhoneRaw(applyMask(cleanRawPhone(matchedCountry.code, rawPart), maskToUse));
      } else {
        setPhoneRaw(value);
      }
    } else {
      setPhoneRaw(value);
    }
  }, [value, isMobile]);

  const currentCountry = getCountryByCode(countryCode);

  const isValid = hasValue && (isMobile ? validateMobile(countryCode, phoneRaw) : validatePhone(countryCode, phoneRaw));
  const isInvalid = touched && hasValue && !isValid;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Clean input (remove non-digits)
    let rawDigits = cleanRawPhone(countryCode, e.target.value);
    
    // 2. Prevent typing more digits than the mask allows (if a mask exists), handle copy/paste with leading zero
    const maskToUse = isMobile && currentCountry.mobileMask ? currentCountry.mobileMask : currentCountry.mask;
    if (maskToUse) {
      const maxDigits = maskToUse.replace(/\D/g, "").length;
      if (rawDigits.length > maxDigits && rawDigits.startsWith("0")) {
        // If pasted with leading zero, try to remove it
        rawDigits = rawDigits.slice(1);
      }
      if (rawDigits.length > maxDigits) {
        // Truncate to max digits instead of ignoring
        rawDigits = rawDigits.slice(0, maxDigits);
      }
    }

    // 3. Apply the mask
    const formatted = applyMask(rawDigits, maskToUse);
    
    setPhoneRaw(formatted);
    
    if (formatted) {
      onChange(`${currentCountry.dialCode} ${formatted}`);
    } else {
      onChange("");
    }
  };

  const handleCountryChange = (newCode: string) => {
    setCountryCode(newCode);
    const c = getCountryByCode(newCode);
    // Re-format the existing phone number with the new country's mask and rules
    const rawDigits = cleanRawPhone(newCode, phoneRaw);
    let finalFormatted = "";
    const maskToUse = isMobile && c.mobileMask ? c.mobileMask : c.mask;
    if (maskToUse) {
      const maxDigits = maskToUse.replace(/\D/g, "").length;
      const truncated = rawDigits.slice(0, maxDigits);
      finalFormatted = applyMask(truncated, maskToUse);
    } else {
      finalFormatted = rawDigits;
    }
    
    setPhoneRaw(finalFormatted);
    if (finalFormatted) {
      onChange(`${c.dialCode} ${finalFormatted}`);
    } else {
      onChange("");
    }
  };

  const options = COUNTRIES.map(c => {
    const displayName = isFa ? c.nameFa : c.name;
    return {
      value: c.code,
      label: `${displayName} (${c.dialCode})`,
      triggerLabel: c.dialCode,
      searchTerms: [c.name, c.nameFa, c.dialCode, c.code],
      icon: (
        <img 
          src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} 
          alt={displayName} 
          className="w-4 h-3 object-cover rounded-[2px]" 
        />
      )
    };
  });

  return (
    <div className="space-y-0.5 w-full min-w-0 font-sans">
      <div
        className={`relative flex items-center h-7 w-full min-w-0 rounded-lg border bg-white dark:bg-black transition-colors ${
          isInvalid
            ? "border-destructive ring-1 ring-destructive"
            : "border-input focus-within:border-form-primary"
        }`}
      >
        <div className="h-full border-r border-border/50 flex items-center shrink-0">
           <Combobox
            options={options}
            value={countryCode}
            onChange={handleCountryChange}
            className="h-full border-0 shadow-none bg-transparent w-[100px] px-1 text-[11px] [&>button]:h-full [&>button]:px-1"
            showSearch={true}
          />
        </div>
        
        <input
          type="tel"
          value={phoneRaw}
          onChange={handlePhoneChange}
          onBlur={() => setTouched(true)}
          placeholder={placeholder || (isMobile ? (currentCountry.exampleMobile || currentCountry.mobileMask || "000 000 0000") : (currentCountry.examplePhone || currentCountry.mask || "000 000 0000"))}
          className="h-full text-xs flex-1 min-w-0 bg-transparent border-0 outline-none font-sans px-2 placeholder:text-muted-foreground/50 text-foreground rtl:text-right ltr:text-left"
          dir="ltr"
        />
        {isValid && (
          <CheckCircle2 className="size-3.5 shrink-0 text-form-primary mx-2" />
        )}
      </div>
      {isInvalid && (
        <div className="text-[10px] text-destructive flex items-center gap-1 font-medium px-1">
          <AlertCircle className="size-3 shrink-0" />
          {errorText}
        </div>
      )}
    </div>
  );
}

function FileUploadField({
  value,
  onChange,
  browseText,
}: {
  value: string;
  onChange: (v: string) => void;
  browseText: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file.name);
    }
  };

  return (
    <div className="relative flex items-center h-7 w-full min-w-0 rounded-lg border border-input bg-white dark:bg-black pl-2 pr-0.5 gap-1 focus-within:border-form-primary transition-colors">
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Select document / spec file..."
        className="h-full text-xs flex-1 min-w-0 bg-transparent border-0 outline-none placeholder:text-muted-foreground text-foreground"
      />
      <Button
        type="button"
        size="xs"
        variant="ghost"
        onClick={() => inputRef.current?.click()}
        className="h-6 px-2 text-[10px] font-semibold gap-1 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
      >
        <FolderOpen className="size-3" />
        {browseText}
      </Button>
    </div>
  );
}

// ─── Main Node Component ────────────────────────────────────────────────────
export const ProjectDataNode = memo(({ id, data, selected }: Props) => {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };

  const pd: ProjectData = (data as any).projectData || {};
  const isJalali = pd.dateIsJalali ?? false;
  const items = pd.items || [];

  const GENDER_OPTIONS = [
    { value: "MR", label: "Mr." },
    { value: "MS", label: "Ms." },
    { value: "MRS", label: "Mrs." },
  ];

  const EQUIPMENT_TYPE_OPTIONS = [
    { value: "Vessel", label: "Vessel" },
    { value: "Reactor", label: "Reactor" },
    { value: "Column", label: "Column" },
    { value: "Storage Tank", label: "Storage Tank" },
    { value: "Heat Exchanger", label: "Heat Exchanger" },
    { value: "Drum", label: "Drum" },
    { value: "Separator", label: "Separator" },
    { value: "Filter", label: "Filter" },
    { value: "Boiler", label: "Boiler" },
    { value: "Other", label: "Other" },
  ];

  const [isListExpanded, setIsListExpanded] = useState<boolean>(true);
  const [draftType, setDraftType] = useState(pd.equipmentType || "Vessel");
  const [draftTag, setDraftTag] = useState(pd.tagNo || "");
  const [draftQty, setDraftQty] = useState<number | string>(pd.qty || 1);
  const [draftDesc, setDraftDesc] = useState(pd.description || "");
  const [addError, setAddError] = useState<string | null>(null);

  const patch = (updates: Partial<ProjectData>) => {
    updateNodeData(id, { projectData: { ...pd, ...updates } });
  };

  const handleAddItem = () => {
    const trimmedTag = draftTag.trim();
    const parsedQty = typeof draftQty === "number" ? draftQty : parseInt(draftQty, 10) || 1;

    if (!trimmedTag) {
      setAddError("Please enter a tag number.");
      return;
    }

    if (items.some((it) => it.tagNo.toLowerCase() === trimmedTag.toLowerCase())) {
      setAddError(`Tag "${trimmedTag}" already exists in the list.`);
      return;
    }

    const newItem: ProjectItem = {
      id: generateItemId(),
      equipmentType: draftType || "Vessel",
      tagNo: trimmedTag,
      qty: parsedQty > 0 ? parsedQty : 1,
      description: draftDesc.trim() || undefined,
    };

    patch({
      items: [...items, newItem],
      tagNo: trimmedTag,
      qty: parsedQty,
      equipmentType: draftType,
    });

    setDraftTag("");
    setDraftDesc("");
    setDraftQty(1);
    setAddError(null);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    patch({ items: newItems });
  };

  return (
    <>
      <VesselNodeToolbar
        id={id}
        selected={selected}
        toolbarPosition={Position.Top}
        onDuplicate={() => duplicateSelected()}
        onReset={() => resetNodesToDefault([id])}
        onDelete={() => deleteNode(id)}
      />

      <VesselNodeContainer
        id={id}
        data={data}
        selected={selected}
        dir="ltr"
        widthClass="w-auto min-w-[380px] max-w-[500px]"
        showHandles={true}
      >
        <VesselNodeHeader
          icon={<Layers size={18} />}
          title="Project Data"
          subtitle={pd.indentNumber ? `Indent: ${pd.indentNumber}` : "Project Specifications"}
          badge={
            pd.indentNumber ? (
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary font-semibold border border-form-primary/20">
                {pd.indentNumber}
              </span>
            ) : undefined
          }
        />

        <div className="p-3 space-y-3 min-w-0">
          {/* Section 1: Identification */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6 space-y-1 min-w-0">
              <VesselFieldLabel label="Indent Number" />
              <Input
                value={pd.indentNumber || ""}
                onChange={(e) => patch({ indentNumber: e.target.value })}
                placeholder="IND-001"
                className="h-7 text-xs bg-white dark:bg-black font-semibold w-full min-w-0"
              />
            </div>
            <div className="col-span-6 space-y-1 min-w-0">
              <VesselFieldLabel label="Date" />
              <div className="nodrag w-full min-w-0">
                <ProjectDatePicker
                  value={pd.date}
                  onChange={(v) => patch({ date: v })}
                  isJalali={isJalali}
                  onToggleCalendar={(newJalali) => patch({ dateIsJalali: newJalali })}
                  placeholder="Select date"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-8 space-y-1 min-w-0">
              <VesselFieldLabel label="Quotation No." />
              <Input
                value={pd.quotationNo || ""}
                onChange={(e) => patch({ quotationNo: e.target.value })}
                placeholder="QT-2026-001"
                className="h-7 text-xs bg-white dark:bg-black font-sans w-full min-w-0"
              />
            </div>
            <div className="col-span-4 space-y-1 min-w-0">
              <VesselFieldLabel label="Revision" />
              <Input
                value={pd.rev || ""}
                onChange={(e) => patch({ rev: e.target.value })}
                placeholder="0"
                className="h-7 text-xs bg-white dark:bg-black font-sans text-center w-full min-w-0"
              />
            </div>
          </div>

          {/* Section 2: Parties & Project Details */}
          <div className="pt-2 border-t border-border space-y-2 min-w-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 min-w-0">
                <VesselFieldLabel label="Customer" />
                <div className="nodrag w-full min-w-0">
                  <Combobox
                    options={CUSTOMER_OPTIONS}
                    value={pd.customer || ""}
                    onChange={(v) => patch({ customer: v })}
                    placeholder="Select customer"
                    className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                  />
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <VesselFieldLabel label="End User" />
                <div className="nodrag w-full min-w-0">
                  <Combobox
                    options={END_USER_OPTIONS}
                    value={pd.endUser || ""}
                    onChange={(v) => patch({ endUser: v })}
                    placeholder="Select end user"
                    className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <VesselFieldLabel label="Plant / Production" />
              <div className="nodrag w-full min-w-0">
                <Combobox
                  options={PLANT_OPTIONS}
                  value={pd.plantProduction || ""}
                  onChange={(v) => patch({ plantProduction: v })}
                  placeholder="Select plant"
                  className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <VesselFieldLabel label="Project Title" />
              <div className="relative flex items-center h-7 w-full min-w-0 rounded-lg border border-input bg-white dark:bg-black pl-2 pr-0.5 gap-1 focus-within:border-form-primary transition-colors">
                <input
                  type="text"
                  value={pd.projectTitle || ""}
                  onChange={(e) => patch({ projectTitle: e.target.value })}
                  placeholder="Project title..."
                  className="h-full text-xs flex-1 min-w-0 bg-transparent border-0 outline-none placeholder:text-muted-foreground text-foreground"
                />
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          const entered = window.prompt(
                            "Please enter the project info URL:",
                            pd.projectLink || "https://"
                          );
                          if (entered !== null && entered.trim() !== "") {
                            patch({ projectLink: entered.trim() });
                            window.open(entered.trim(), "_blank", "noopener,noreferrer");
                          }
                        }}
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-form-primary hover:bg-form-primary/10 transition-colors"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs z-50">
                      {pd.projectLink
                        ? `Open link: ${pd.projectLink}`
                        : "Project info (Click to open / set link)"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Section 3: Contact Info */}
          <div className="pt-2 border-t border-border space-y-2 min-w-0">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 space-y-1 min-w-0">
                <VesselFieldLabel label="Title" />
                <div className="nodrag w-full min-w-0">
                  <Combobox
                    options={GENDER_OPTIONS}
                    value={pd.gender || "MR"}
                    onChange={(v) => patch({ gender: v })}
                    placeholder="Title"
                    className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                  />
                </div>
              </div>
              <div className="col-span-8 space-y-1 min-w-0">
                <VesselFieldLabel label="Contact Person" />
                <Input
                  value={pd.contactPerson || ""}
                  onChange={(e) => patch({ contactPerson: e.target.value })}
                  placeholder="Full name"
                  className="h-7 text-xs bg-white dark:bg-black w-full min-w-0"
                />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <VesselFieldLabel label="Email Address" />
              <div className="nodrag w-full min-w-0">
                <EmailField
                  value={pd.email || ""}
                  onChange={(v) => patch({ email: v })}
                  errorText="Invalid email format"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 min-w-0">
                <VesselFieldLabel label="Phone Number" />
                <div className="nodrag w-full min-w-0">
                  <PhoneField
                    value={pd.phoneNumber || ""}
                    onChange={(v) => patch({ phoneNumber: v })}
                    errorText="Invalid phone number"
                  />
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <VesselFieldLabel label="Mobile Number" />
                <div className="nodrag w-full min-w-0">
                  <PhoneField
                    value={pd.mobileNumber || ""}
                    onChange={(v) => patch({ mobileNumber: v })}
                    isMobile
                    errorText="Invalid mobile number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Technical Documents */}
          <div className="pt-2 border-t border-border space-y-1 min-w-0">
            <VesselFieldLabel label="Upload Technical Documents" />
            <div className="nodrag w-full min-w-0">
              <FileUploadField
                value={pd.uploadDocuments || ""}
                onChange={(v) => patch({ uploadDocuments: v })}
                browseText="Browse"
              />
            </div>
          </div>

          {/* Section 5: Equipment Items, Add Button & Collapsible List */}
          <div className="pt-2 border-t border-border space-y-2 min-w-0">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsListExpanded(!isListExpanded)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsListExpanded(!isListExpanded);
                }
              }}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/40 hover:bg-muted/60 border border-border cursor-pointer transition-colors select-none"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Tag className="size-3.5 text-form-primary shrink-0" />
                <span className="text-[11px] font-bold text-foreground truncate">
                  Equipment Items
                </span>
                {items.length > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-form-primary/10 text-form-primary border border-form-primary/20 shrink-0">
                    {items.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                {isListExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </div>
            </div>

            {isListExpanded && (
              <div className="space-y-2.5 pt-1 min-w-0">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5 space-y-1 min-w-0">
                    <VesselFieldLabel label="Equipment Type" />
                    <div className="nodrag w-full min-w-0">
                      <Combobox
                        options={EQUIPMENT_TYPE_OPTIONS}
                        value={draftType}
                        onChange={(v) => setDraftType(v || "Vessel")}
                        placeholder="Equipment Type"
                        className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                      />
                    </div>
                  </div>
                  <div className="col-span-4 space-y-1 min-w-0">
                    <VesselFieldLabel label="Tag Number *" />
                    <Input
                      value={draftTag}
                      onChange={(e) => {
                        setDraftTag(e.target.value);
                        if (addError) setAddError(null);
                      }}
                      placeholder="e.g. V-101"
                      className="h-7 text-xs font-semibold bg-white dark:bg-black w-full min-w-0"
                    />
                  </div>
                  <div className="col-span-3 space-y-1 min-w-0">
                    <VesselFieldLabel label="Quantity" />
                    <Input
                      type="number"
                      min={1}
                      value={draftQty}
                      onChange={(e) => setDraftQty(e.target.value)}
                      placeholder="1"
                      className="h-7 text-xs bg-white dark:bg-black w-full min-w-0"
                    />
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <VesselFieldLabel label="Description / Remarks" />
                  <Textarea
                    value={draftDesc}
                    onChange={(e) => setDraftDesc(e.target.value)}
                    placeholder="Description / Remarks..."
                    className="min-h-[54px] text-xs resize-none bg-white dark:bg-black w-full min-w-0"
                    rows={2}
                  />
                </div>

                {addError && (
                  <div className="text-[10px] text-destructive flex items-center gap-1 font-medium bg-destructive/10 p-1.5 rounded">
                    <AlertCircle className="size-3 shrink-0" />
                    {addError}
                  </div>
                )}

                {/* Add Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="w-full h-7 text-xs font-semibold gap-1.5 border-form-primary/40 text-form-primary hover:bg-form-primary/10 hover:border-form-primary transition-colors"
                >
                  <Plus className="size-3.5" />
                  Add Item
                </Button>

                {/* Items List */}
                {items.length > 0 && (
                  <div className="space-y-1.5 pt-1 min-w-0">
                    <VesselFieldLabel label="Configured Items" />
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                      {items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/30 transition-colors group min-w-0"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[11px] font-bold bg-form-primary/10 text-form-primary px-1.5 py-0.5 rounded border border-form-primary/20 shrink-0">
                              {item.tagNo}
                            </span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[11px] font-medium text-foreground truncate">
                                  {item.equipmentType || "Vessel"}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                                  (×{item.qty})
                                </span>
                              </div>
                              {item.description && (
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-[10px] text-muted-foreground truncate block max-w-[200px] cursor-help">
                                        {item.description}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      align="start"
                                      className="max-w-xs text-xs p-2 break-words shadow-lg border border-border bg-popover text-popover-foreground z-50"
                                    >
                                      {item.description}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(idx)}
                            className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded"
                            title="Delete"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <VesselNodeFooter>
          <div className="flex items-center justify-between min-w-0 w-full">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-medium text-form-primary/70 uppercase tracking-wider truncate">
                {pd.indentNumber || "IND-001"} • Rev {pd.rev || "0"}
              </span>
              {pd.quotationNo && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary font-bold truncate">
                  {pd.quotationNo}
                </span>
              )}
            </div>
            <span className="text-xs font-bold tabular-nums text-form-primary shrink-0">
              {items.length > 0
                ? `${items.length} ${items.length === 1 ? "Item" : "Items"}`
                : pd.tagNo
                ? `${pd.tagNo} (×${pd.qty || 1})`
                : "0 Items"}
            </span>
          </div>
        </VesselNodeFooter>
      </VesselNodeContainer>
    </>
  );
});

ProjectDataNode.displayName = "ProjectDataNode";
