// src/modules/datasheet-ai/components/DatasheetUploader.tsx
"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { datasheetApi } from "../services/datasheet-api";
import { DatasheetDocument } from "../types/datasheet.types";
import { toast } from "sonner";

interface DatasheetUploaderProps {
  onUploadSuccess: (newDoc: DatasheetDocument) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];

export function DatasheetUploader({ onUploadSuccess }: DatasheetUploaderProps) {
  const t = useTranslations("DatasheetAI");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return isRtl
        ? "فرمت فایل نامعتبر است. فقط فایل‌های PDF، JPG و PNG مجاز هستند."
        : "Invalid format. Only PDF, JPG, and PNG files are supported.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return isRtl
        ? "حجم فایل بیشتر از سقف مجاز ۵۰ مگابایت است."
        : "File size exceeds the 50MB limit.";
    }
    return null;
  };

  const handleProcessFile = async (file: File) => {
    const errorMsg = validateFile(file);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 250);

      const doc = await datasheetApi.uploadDocument(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(
        isRtl
          ? `دیتاشیت «${file.name}» با موفقیت بارگذاری شد.`
          : `Datasheet "${file.name}" uploaded successfully.`
      );
      onUploadSuccess(doc);
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "خطا در بارگذاری فایل" : "Upload failed"));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
    if (e.target) e.target.value = "";
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer group",
          isDragging
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-border/70 hover:border-primary/50 bg-card/60 hover:bg-card/90"
        )}
      >
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-105 transition-transform">
          {isUploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <UploadCloud className="size-6" />
          )}
        </div>

        <h4 className="text-sm font-bold text-foreground text-center">
          {isRtl ? "بارگذاری دیتاشیت تجهیزات صنعتی" : "Upload Industrial Equipment Datasheet"}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
          {isRtl
            ? "فایل دیتاشیت PDF یا تصویر اسکن‌شده را به اینجا بکشید یا برای انتخاب کلیک کنید (حداکثر ۵۰ مگابایت)"
            : "Drag & drop PDF datasheet or high-res image here, or click to browse (up to 50MB)"}
        </p>

        <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground/80 font-mono">
          <span className="px-2 py-0.5 rounded bg-muted/60 border border-border/40">PDF</span>
          <span className="px-2 py-0.5 rounded bg-muted/60 border border-border/40">PNG</span>
          <span className="px-2 py-0.5 rounded bg-muted/60 border border-border/40">JPG</span>
          <span className="px-2 py-0.5 rounded bg-muted/60 border border-border/40">OCR On-Premise</span>
        </div>

        {isUploading && (
          <div className="w-full max-w-xs mt-4 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>{selectedFile?.name}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1.5" />
          </div>
        )}
      </div>
    </div>
  );
}
