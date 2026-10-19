// src/modules/tasks/components/task-attachments-section.tsx
"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  File as GenericFile,
  UploadCloud,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskAttachment } from "../types/tasks.types";
import { cn } from "@/lib/utils";

interface TaskAttachmentsSectionProps {
  taskId: string;
  attachments: TaskAttachment[];
  onUploadAttachment: (
    taskId: string,
    file: { name: string; size: string; type: string; url?: string }
  ) => Promise<void>;
  onDeleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
}

export function TaskAttachmentsSection({
  taskId,
  attachments,
  onUploadAttachment,
  onDeleteAttachment,
}: TaskAttachmentsSectionProps) {
  const t = useTranslations("Tasks.attachments");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getFileIcon = (type: string, name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || type.toLowerCase();
    if (ext === "pdf") return <FileText className="size-5 text-rose-500" />;
    if (["xlsx", "xls", "csv", "excel"].includes(ext))
      return <FileSpreadsheet className="size-5 text-emerald-500" />;
    if (["png", "jpg", "jpeg", "webp", "image"].includes(ext))
      return <ImageIcon className="size-5 text-violet-500" />;
    if (["zip", "rar", "7z", "tar"].includes(ext))
      return <FileArchive className="size-5 text-amber-500" />;
    if (["dwg", "dxf", "json", "ts", "js", "html"].includes(ext))
      return <FileCode className="size-5 text-sky-500" />;
    return <GenericFile className="size-5 text-muted-foreground" />;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || isUploading) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sizeKb = file.size / 1024;
        const sizeStr =
          sizeKb > 1024
            ? `${(sizeKb / 1024).toFixed(1)} MB`
            : `${Math.round(sizeKb)} KB`;

        await onUploadAttachment(taskId, {
          name: file.name,
          size: sizeStr,
          type: file.name.split(".").pop() || "file",
        });
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = (att: TaskAttachment) => {
    // Generate a lightweight blob download for demo
    const blob = new Blob([`Dummy preview for ${att.name}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = att.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 fa-num">
      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center select-none",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border/60 hover:border-primary/50 bg-muted/15 hover:bg-muted/30"
        )}
      >
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <UploadCloud className="size-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            {t("dropzone")}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {t("supportNotice")}
          </span>
        </div>
      </div>

      {/* Attachments List */}
      <div className="flex flex-col gap-2 pt-1">
        {attachments.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground border border-border/40 rounded-xl bg-muted/10">
            {t("noAttachments")}
          </div>
        ) : (
          attachments.map((att) => (
            <div
              key={att.id}
              className="p-2.5 sm:p-3 rounded-xl border border-border/50 bg-white/70 dark:bg-card/50 flex items-center justify-between gap-3 shadow-2xs hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-muted/40 shrink-0">
                  {getFileIcon(att.type, att.name)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {att.name}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{att.size}</span>
                    <span>•</span>
                    <span>{att.uploadedAt}</span>
                    {att.uploaderName && (
                      <>
                        <span>•</span>
                        <span>{att.uploaderName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDownload(att)}
                  className="rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                  title={t("download")}
                >
                  <Download className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDeleteAttachment(taskId, att.id)}
                  className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  title={t("delete")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
