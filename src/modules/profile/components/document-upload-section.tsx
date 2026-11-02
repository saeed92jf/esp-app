"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  GraduationCap,
  CreditCard,
  BookOpen,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Maximize2,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserUploadedDocument, DocumentCategory } from "@/types/auth";
import { toPersianDigits } from "@/utils/textDirection";
import { cn } from "@/lib/utils";
import { getLocalizedDocumentTitle } from "../utils/document-helpers";

interface DocumentUploadSectionProps {
  documents: UserUploadedDocument[];
  onChange: (docs: UserUploadedDocument[]) => void;
  activeCategory?: DocumentCategory | null;
  onActiveCategoryChange?: (category: DocumentCategory | null) => void;
  readOnly?: boolean;
}

interface RequiredDocDef {
  category: DocumentCategory;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
}

const REQUIRED_DOCS: RequiredDocDef[] = [
  {
    category: "national_card_front",
    titleFa: "تصویر روی کارت ملی",
    titleEn: "National ID Card (Front)",
    descriptionFa: "تصویر واضح، خوانا و باکیفیت از روی کارت هوشمند ملی یا رسید ثبت‌نام",
    descriptionEn: "Clear and legible photo of the front side of national ID card",
    icon: CreditCard,
    required: true,
  },
  {
    category: "national_card_back",
    titleFa: "تصویر پشت کارت ملی",
    titleEn: "National ID Card (Back)",
    descriptionFa: "تصویر واضح از پشت کارت هوشمند ملی شامل بارکد و کد رهگیری",
    descriptionEn: "Clear photo of the back side of national ID card",
    icon: CreditCard,
    required: true,
  },
  {
    category: "birth_certificate",
    titleFa: "تصویر صفحات شناسنامه",
    titleEn: "Birth Certificate",
    descriptionFa: "تصویر خوانا از صفحه اول (و صفحه توضیحات/همسر در صورت تاهل)",
    descriptionEn: "Clear photo of identity pages of the birth certificate",
    icon: BookOpen,
    required: true,
  },
  {
    category: "university_degree",
    titleFa: "تصویر آخرین مدرک دانشگاهی",
    titleEn: "Latest University Degree",
    descriptionFa: "تصویر باکیفیت از اصل آخرین دانشنامه، گواهی موقت پایان تحصیلات یا استعلام دانشگاهی",
    descriptionEn: "Official photo of your highest/latest university diploma or graduation certificate",
    icon: GraduationCap,
    required: true,
  },
  {
    category: "other",
    titleFa: "تصویر دوره‌ها یا گواهی‌های تخصصی (اختیاری)",
    titleEn: "Professional Certifications (Optional)",
    descriptionFa: "عکس گواهی‌نامه‌های آموزشی، دوره‌های بین‌المللی یا سوابق تخصصی",
    descriptionEn: "Specialized training certificates or work credentials photo",
    icon: FileText,
    required: false,
  },
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

export function DocumentUploadSection({
  documents = [],
  onChange,
  activeCategory: controlledActiveCategory,
  onActiveCategoryChange: controlledOnActiveCategoryChange,
  readOnly = false,
}: DocumentUploadSectionProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [internalActiveCategory, setInternalActiveCategory] = useState<DocumentCategory | null>(null);
  const activeCategory = controlledActiveCategory !== undefined ? controlledActiveCategory : internalActiveCategory;
  const setActiveCategory = controlledOnActiveCategoryChange || setInternalActiveCategory;

  const [fullscreenDoc, setFullscreenDoc] = useState<UserUploadedDocument | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const formatFileSize = (bytes: number | string) => {
    if (typeof bytes === "string") {
      const num = parseFloat(bytes);
      if (isNaN(num)) return bytes;
      bytes = num;
    }
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      const kb = (bytes / 1024).toFixed(1);
      return isRtl ? `${toPersianDigits(kb)} کیلوبایت` : `${kb} KB`;
    }
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return isRtl ? `${toPersianDigits(mb)} مگابایت` : `${mb} MB`;
  };

  const handleFileSelect = (category: DocumentCategory, file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(
        isRtl
          ? "حداکثر حجم مجاز تصویر ۱۰ مگابایت است."
          : "Maximum allowed image size is 10 MB."
      );
      return;
    }

    const fileType = file.type.toLowerCase();
    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType) || fileType.startsWith("image/");
    if (!isImage) {
      toast.error(
        isRtl
          ? "تنها بارگذاری فایل‌های تصویری (JPG, PNG, WEBP) مجاز است. فایل‌های PDF یا اسناد متنی پذیرفته نمی‌شوند."
          : "Only image files (JPG, PNG, WEBP) are allowed. PDF or documents are not accepted."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const targetDef = REQUIRED_DOCS.find((d) => d.category === category);
      const title = isRtl ? targetDef?.titleFa || category : targetDef?.titleEn || category;

      const newDoc: UserUploadedDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category,
        title,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "image/jpeg",
        fileData: dataUrl,
        uploadedAt: new Date().toLocaleDateString(isRtl ? "fa-IR" : "en-US"),
      };

      const filtered = documents.filter((d) => d.category !== category);
      const nextDocs = [...filtered, newDoc];
      onChange(nextDocs);

      toast.success(
        isRtl
          ? `${title} با موفقیت بارگذاری شد.`
          : `${title} uploaded successfully.`
      );
    };

    reader.readAsDataURL(file);
  };

  const handleRemove = (category: DocumentCategory) => {
    const target = documents.find((d) => d.category === category);
    const nextDocs = documents.filter((d) => d.category !== category);
    onChange(nextDocs);
    if (target) {
      toast.info(
        isRtl
          ? `مدرک «${target.title}» حذف گردید.`
          : `Removed ${target.title}.`
      );
    }
  };

  // Fullscreen Viewer Controls
  const handleOpenFullscreen = (doc: UserUploadedDocument) => {
    setFullscreenDoc(doc);
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleCloseFullscreen = useCallback(() => {
    setFullscreenDoc(null);
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(3.5, Number((prev + 0.25).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = Math.max(0.5, Number((prev - 0.25).toFixed(2)));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetTransform = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Keyboard navigation for fullscreen lightbox
  useEffect(() => {
    if (!fullscreenDoc) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseFullscreen();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetTransform();
      } else if (e.key === "r" || e.key === "R") {
        handleRotate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreenDoc, handleCloseFullscreen, handleZoomIn, handleZoomOut, handleResetTransform, handleRotate]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleDoubleClick = () => {
    if (zoom > 1) {
      handleResetTransform();
    } else {
      setZoom(2);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Completion calculation
  const mandatoryCategories = REQUIRED_DOCS.filter((d) => d.required).map((d) => d.category);
  const uploadedMandatoryCount = mandatoryCategories.filter((c) =>
    documents.some((d) => d.category === c)
  ).length;
  const isAllMandatoryUploaded = uploadedMandatoryCount === mandatoryCategories.length;

  const activeDocDef = activeCategory ? REQUIRED_DOCS.find((d) => d.category === activeCategory) : null;
  const activeUploaded = activeCategory ? documents.find((d) => d.category === activeCategory) : null;
  const ActiveIcon = activeDocDef?.icon;

  return (
    <div className="w-full">
      {/* Hidden file inputs for each category (Images only: JPG, PNG, WEBP) */}
      {REQUIRED_DOCS.map((docDef) => (
        <input
          key={`input-${docDef.category}`}
          type="file"
          ref={(el) => {
            fileInputRefs.current[docDef.category] = el;
          }}
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(docDef.category, file);
            }
            e.target.value = "";
          }}
        />
      ))}

      {/* ─────────────────────────────────────────────────────────────
          MODE A: INSIDE THE ITEM (محیط داخلی اختصاصی آیتم)
          ───────────────────────────────────────────────────────────── */}
      {activeDocDef ? (
        <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
          {/* Header: Back button + Item Title + Bare Icon */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted/60 cursor-pointer"
              onClick={() => setActiveCategory(null)}
            >
              <ArrowLeft className="size-6 text-foreground rtl:rotate-180" />
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              {ActiveIcon && <ActiveIcon className="size-6 text-muted-foreground shrink-0" />}
              <h2 className="text-2xl sm:text-3xl font-normal text-foreground">
                {isRtl ? activeDocDef.titleFa : activeDocDef.titleEn}
              </h2>
              {activeDocDef.required ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {isRtl ? "الزامی" : "Required"}
                </span>
              ) : (
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/50">
                  {isRtl ? "اختیاری" : "Optional"}
                </span>
              )}
            </div>
          </div>

          {/* Sub-container inside item */}
          <div className="ps-0 sm:ps-14">
            <div className="bg-white dark:bg-card border border-border/60 rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6">
              {/* Description / Requirement guide */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {isRtl ? activeDocDef.descriptionFa : activeDocDef.descriptionEn}
                </p>
              </div>

              {activeUploaded ? (
                /* 1. DOCUMENT IMAGE PREVIEW CONTENT (نمایش عکس مدرک با امکان تمام‌صفحه) */
                <div className="space-y-6">
                  {/* High-res Image preview container */}
                  <div
                    onClick={() => handleOpenFullscreen(activeUploaded)}
                    className="relative rounded-2xl overflow-hidden border border-border/70 bg-muted/15 p-3 sm:p-4 flex flex-col items-center justify-center max-w-xl mx-auto shadow-xs group/img cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="relative w-full flex items-center justify-center min-h-[220px] max-h-[360px] overflow-hidden rounded-xl bg-black/5 dark:bg-black/30">
                      <img
                        src={activeUploaded.fileData || activeUploaded.fileUrl}
                        alt={activeUploaded.fileName}
                        className="max-h-[340px] w-auto max-w-full rounded-lg object-contain shadow-xs transition-transform duration-200 group-hover/img:scale-[1.02]"
                      />

                      {/* Hover overlay hint */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                        <div className="px-4 py-2 rounded-full bg-black/75 backdrop-blur-sm border border-white/20 flex items-center gap-2 text-xs font-semibold shadow-lg">
                          <Maximize2 className="size-4" />
                          <span>{isRtl ? "نمایش فول‌اسکرین و بزرگ" : "View Fullscreen"}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFullscreen(activeUploaded);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer py-1 px-3 rounded-full hover:bg-primary/10 transition-colors"
                    >
                      <Maximize2 className="size-3.5" />
                      <span>{isRtl ? "مشاهده تمام‌صفحه و باکیفیت تصویر (فول‌اسکرین)" : "View Fullscreen Image"}</span>
                    </button>
                  </div>

                  {/* File Metadata & Quick Actions */}
                  <div className="flex items-center justify-between gap-3 flex-wrap max-w-xl mx-auto text-xs pt-1">
                    <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {activeUploaded.fileName}
                      </span>
                      <span>•</span>
                      <span className="fa-num">{formatFileSize(activeUploaded.fileSize)}</span>
                      {activeUploaded.uploadedAt && (
                        <>
                          <span>•</span>
                          <span className="fa-num">
                            {isRtl ? `ثبت: ${activeUploaded.uploadedAt}` : `Uploaded: ${activeUploaded.uploadedAt}`}
                          </span>
                        </>
                      )}
                    </div>

                    {!readOnly && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRefs.current[activeDocDef.category]?.click()}
                          className="h-8 px-3 rounded-full text-xs font-semibold gap-1.5 cursor-pointer hover:border-primary/40 hover:text-primary"
                        >
                          <UploadCloud className="size-3.5" />
                          <span>{isRtl ? "جایگزینی تصویر" : "Replace Image"}</span>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(activeDocDef.category)}
                          className="h-8 px-3 rounded-full text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer gap-1.5"
                        >
                          <Trash2 className="size-3.5" />
                          <span>{isRtl ? "حذف تصویر" : "Delete"}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : !readOnly ? (
                /* 2. UPLOAD CONTENT INSIDE ITEM (محیط بارگذاری اختصاصی عکس) */
                <div
                  onClick={() => fileInputRefs.current[activeDocDef.category]?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelect(activeDocDef.category, file);
                  }}
                  className="border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/[0.03] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors text-center group/drop max-w-xl mx-auto"
                >
                  <UploadCloud className="size-9 text-muted-foreground group-hover/drop:text-foreground transition-colors" />
                  <div className="space-y-1.5">
                    <h5 className="text-base font-bold text-foreground">
                      {isRtl
                        ? "برای انتخاب یا کشیدن تصویر مدرک اینجا کلیک کنید"
                        : "Click to select or drag & drop document image here"}
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      {isRtl
                        ? "تصویر خوانا، واضح و باکیفیت از مدرک را بارگذاری فرمایید."
                        : "Upload a clear, high-resolution photo of the document."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground flex-wrap justify-center">
                    <span className="font-mono bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/50 text-foreground font-semibold">
                      {isRtl ? "فقط عکس: JPG, PNG, WEBP" : "Images only: JPG, PNG, WEBP"}
                    </span>
                    <span>•</span>
                    <span>{isRtl ? "حداکثر ۱۰ مگابایت" : "Max 10 MB"}</span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2 rounded-full px-6 font-bold gap-2 pointer-events-none"
                  >
                    <UploadCloud className="size-4" />
                    <span>{isRtl ? "انتخاب تصویر از دستگاه" : "Choose Image"}</span>
                  </Button>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl max-w-xl mx-auto">
                  {isRtl ? "هیچ تصویری بارگذاری نشده است." : "No image has been uploaded."}
                </div>
              )}

              {/* Bottom Actions: Back to documents list */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/40">
                <Button
                  variant="ghost"
                  onClick={() => setActiveCategory(null)}
                  className="rounded-full px-6 font-medium text-primary hover:bg-primary/5 cursor-pointer"
                >
                  {isRtl ? "بازگشت به لیست مدارک" : "Back to Documents List"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            MODE B: SEGMENTED LIST (شبیه Personal Info: بدون بک‌گراند، رنگ muted)
            ───────────────────────────────────────────────────────────── */
        <div className="w-full">
          {/* Informative Guidance & Status Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-muted/20 border border-border/70 flex items-center justify-between gap-3.5 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  "size-9 rounded-xl flex items-center justify-center shrink-0",
                  isAllMandatoryUploaded
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isAllMandatoryUploaded ? <CheckCircle2 className="size-4.5" /> : <Sparkles className="size-4.5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">
                    {isRtl ? "وضعیت تصاویر مدارک هویتی و تحصیلی" : "Identity & Academic Documents Status"}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold",
                      isAllMandatoryUploaded
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                        : "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10"
                    )}
                  >
                    {isAllMandatoryUploaded
                      ? isRtl
                        ? "تکمیل شده"
                        : "Complete"
                      : isRtl
                      ? "نیاز به تکمیل"
                      : "Pending Uploads"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {isRtl
                    ? "جهت احراز هویت پرسنلی، بارگذاری تصاویر واضح و باکیفیت از مدارک الزامی ضروری است."
                    : "Upload clear and legible photos of mandatory credentials for verification."}
                </p>
              </div>
            </div>
            <div className="shrink-0 font-sans">
              <span
                className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full border",
                  isAllMandatoryUploaded
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                )}
              >
                {isRtl
                  ? `${toPersianDigits(uploadedMandatoryCount)} از ${toPersianDigits(mandatoryCategories.length)} مدرک الزامی`
                  : `${uploadedMandatoryCount} of ${mandatoryCategories.length} Required`}
              </span>
            </div>
          </div>

          {/* Segmented List: Clean single-line items, bare icons like Personal Info */}
          <div className="segmented-list mb-10">
            {REQUIRED_DOCS.map((docDef) => {
              const uploaded = documents.find((d) => d.category === docDef.category);
              const Icon = docDef.icon;

              return (
                <div
                  key={docDef.category}
                  onClick={() => setActiveCategory(docDef.category)}
                  className="segmented-item no-hover-bg shadow-none flex items-center justify-between px-4 sm:px-6 relative outline-none cursor-pointer group h-[72px]"
                >
                  <span
                    className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ease-out group-hover:duration-0 pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Left: Bare Icon + Title + (الزامی / اختیاری) — Exactly like Personal Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <Icon className="size-5 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">
                        {isRtl ? docDef.titleFa : docDef.titleEn}
                      </span>
                      {docDef.required ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                          {isRtl ? "الزامی" : "Required"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/50 shrink-0">
                          {isRtl ? "اختیاری" : "Optional"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Brief Status Summary & ChevronRight */}
                  <div className="flex items-center gap-3 shrink-0 ms-2">
                    {uploaded ? (
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* File brief info */}
                        <div className="flex flex-col items-end text-end max-w-[120px] sm:max-w-[200px] truncate hidden sm:flex">
                          <span className="text-xs font-semibold text-foreground truncate max-w-full">
                            {uploaded.fileName}
                          </span>
                          <span className="text-[10px] text-muted-foreground fa-num">
                            {formatFileSize(uploaded.fileSize)}
                          </span>
                        </div>

                        {/* Uploaded badge */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                          <CheckCircle2 className="size-3.5" />
                          <span>{isRtl ? "ثبت شده" : "Uploaded"}</span>
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-normal text-muted-foreground bg-muted/40 px-2.5 py-0.5 rounded-full border border-border/40 shrink-0">
                        <span>{isRtl ? "بارگذاری نشده" : "Not uploaded"}</span>
                      </span>
                    )}

                    <ChevronRight className="size-5 text-muted-foreground shrink-0 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TRUE FULLSCREEN LIGHTBOX (نمایش بزرگ، تمام‌صفحه و باکیفیت تصویر مدرک)
          ───────────────────────────────────────────────────────────── */}
      {fullscreenDoc && mounted && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-200"
          tabIndex={-1}
        >
          {/* Top Toolbar */}
          <div className="h-16 px-4 sm:px-6 border-b border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 z-10 text-white">
            {/* Title & Metadata */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <ImageIcon className="size-4.5 text-white/90" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {getLocalizedDocumentTitle(fullscreenDoc, locale)}
                  </h3>
                  {fullscreenDoc.category && REQUIRED_DOCS.find((d) => d.category === fullscreenDoc.category)?.required ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {isRtl ? "الزامی" : "Required"}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-white/60 truncate mt-0.5 fa-num">
                  {fullscreenDoc.fileName} • {formatFileSize(fullscreenDoc.fileSize)}
                  {fullscreenDoc.uploadedAt ? ` • ${isRtl ? `تاریخ: ${fullscreenDoc.uploadedAt}` : fullscreenDoc.uploadedAt}` : ""}
                </p>
              </div>
            </div>

            {/* Control Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Zoom Controls */}
              <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="size-8 rounded-full text-white/90 hover:text-white hover:bg-white/15 disabled:opacity-30 cursor-pointer"
                  title={isRtl ? "کوچک‌نمایی (-)" : "Zoom Out (-)"}
                >
                  <ZoomOut className="size-4" />
                </Button>

                <button
                  type="button"
                  onClick={handleResetTransform}
                  className="px-2 text-xs font-mono font-medium text-white/80 hover:text-white cursor-pointer min-w-[48px] text-center"
                  title={isRtl ? "بازنشانی اندازه (0)" : "Reset Zoom (0)"}
                >
                  {Math.round(zoom * 100)}%
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3.5}
                  className="size-8 rounded-full text-white/90 hover:text-white hover:bg-white/15 disabled:opacity-30 cursor-pointer"
                  title={isRtl ? "بزرگ‌نمایی (+)" : "Zoom In (+)"}
                >
                  <ZoomIn className="size-4" />
                </Button>
              </div>

              {/* Rotate */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRotate}
                className="size-8 sm:size-9 rounded-full text-white/90 hover:text-white hover:bg-white/15 cursor-pointer"
                title={isRtl ? "چرخش ۹۰ درجه (R)" : "Rotate 90° (R)"}
              >
                <RotateCw className="size-4" />
              </Button>

              {/* Download */}
              {(fullscreenDoc.fileData || fullscreenDoc.fileUrl) && (
                <a
                  href={fullscreenDoc.fileData || fullscreenDoc.fileUrl}
                  download={fullscreenDoc.fileName}
                  className="size-8 sm:size-9 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-colors"
                  title={isRtl ? "دانلود تصویر" : "Download Image"}
                >
                  <Download className="size-4" />
                </a>
              )}

              <div className="w-px h-6 bg-white/20 mx-1" />

              {/* Close Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCloseFullscreen}
                className="h-8 sm:h-9 rounded-full px-3 text-xs font-bold text-white hover:bg-white/20 cursor-pointer gap-1.5"
                title={isRtl ? "بستن (Esc)" : "Close (Esc)"}
              >
                <X className="size-4.5" />
                <span className="hidden sm:inline">{isRtl ? "بستن" : "Close"}</span>
              </Button>
            </div>
          </div>

          {/* Center Image Canvas */}
          <div
            className={cn(
              "flex-1 w-full h-[calc(100vh-64px)] overflow-hidden flex items-center justify-center p-4 relative",
              zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
          >
            <img
              src={fullscreenDoc.fileData || fullscreenDoc.fileUrl}
              alt={fullscreenDoc.fileName}
              draggable={false}
              className={cn(
                "max-w-full max-h-full object-contain drop-shadow-2xl select-none",
                isDragging ? "transition-none" : "transition-transform duration-200 ease-out"
              )}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            />
          </div>

          {/* Floating Bottom Helper */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/70 text-[11px] pointer-events-none flex items-center gap-3">
            <span>{isRtl ? "اسکرول یا دابل‌کلیک: زوم" : "Scroll / Double-click: Zoom"}</span>
            <span>•</span>
            <span>{isRtl ? "درگ: جابجایی تصویر" : "Drag: Pan"}</span>
            <span>•</span>
            <span>{isRtl ? "کلید Esc: خروج" : "Esc: Close"}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
