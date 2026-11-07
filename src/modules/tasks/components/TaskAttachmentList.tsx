// src/modules/tasks/components/TaskAttachmentList.tsx
"use client";

import React, { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  File as GenericFile,
  Download,
  X,
  Eye,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { TaskAttachmentItem } from "../services/new-tasks.service";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function readAttachmentFile(file: File): Promise<TaskAttachmentItem> {
  const MAX_BYTES = 15 * 1024 * 1024; // 15MB limit
  if (file.size > MAX_BYTES) {
    throw new Error(`حجم فایل "${file.name}" بیش از ۱۵ مگابایت است.`);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "file";

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: formatBytes(file.size),
        type: ext,
        url: reader.result as string,
        uploaded_at: new Date().toISOString(),
      });
    };
    reader.onerror = () => reject(new Error(`خطا در بارگذاری فایل ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function downloadAttachment(att: TaskAttachmentItem) {
  if (!att.url) return;
  const a = document.createElement("a");
  a.href = att.url;
  a.download = att.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function isImageAttachment(att: TaskAttachmentItem): boolean {
  const ext = (att.name?.split(".").pop() || att.type || "").toLowerCase();
  return (
    ["png", "jpg", "jpeg", "webp", "gif"].includes(ext) ||
    Boolean(att.url?.startsWith("data:image"))
  );
}

export function getAttachmentIcon(type?: string, name?: string, className = "size-4") {
  const ext = (name?.split(".").pop() || type || "").toLowerCase();
  if (["pdf"].includes(ext)) {
    return <FileText className={cn(className, "text-rose-500")} />;
  }
  if (["xlsx", "xls", "csv", "tsv"].includes(ext)) {
    return <FileSpreadsheet className={cn(className, "text-emerald-500")} />;
  }
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
    return <ImageIcon className={cn(className, "text-violet-500")} />;
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return <FileArchive className={cn(className, "text-amber-500")} />;
  }
  if (["dwg", "dxf", "step", "stp", "iges", "igs", "stl"].includes(ext)) {
    return <FileCode className={cn(className, "text-sky-500")} />;
  }
  if (["doc", "docx", "txt", "md"].includes(ext)) {
    return <FileText className={cn(className, "text-blue-500")} />;
  }
  return <GenericFile className={cn(className, "text-muted-foreground")} />;
}

interface TaskAttachmentListProps {
  attachments: TaskAttachmentItem[];
  onRemove?: (index: number) => void;
  isRtl?: boolean;
  compact?: boolean;
  inPrimaryBubble?: boolean;
  className?: string;
}

export function TaskAttachmentList({
  attachments,
  onRemove,
  isRtl = true,
  compact = false,
  inPrimaryBubble = false,
  className,
}: TaskAttachmentListProps) {
  const [previewImage, setPreviewImage] = useState<TaskAttachmentItem | null>(null);

  if (!attachments || attachments.length === 0) return null;

  // Compact variant: used inside chat / progress bubbles
  if (compact) {
    return (
      <>
        <div className={cn("flex flex-wrap gap-2 pt-1.5", className)}>
          {attachments.map((att, idx) => {
            const isImg = isImageAttachment(att);
            return (
              <div
                key={att.id || idx}
                className={cn(
                  "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all shadow-2xs select-none",
                  inPrimaryBubble
                    ? "bg-white/15 hover:bg-white/25 text-white border-white/25"
                    : "bg-background hover:bg-muted/70 text-foreground border-border/70"
                )}
              >
                {isImg && att.url ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(att)}
                    className="size-7 rounded-lg overflow-hidden shrink-0 border border-white/20 bg-black/10 cursor-pointer relative group"
                    title={isRtl ? "مشاهده تصویر" : "View image"}
                  >
                    <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="shrink-0">{getAttachmentIcon(att.type, att.name)}</div>
                )}

                <div className="flex flex-col min-w-0 max-w-[160px] sm:max-w-[220px]">
                  <span className="font-semibold truncate text-[11px] leading-tight" title={att.name}>
                    {att.name}
                  </span>
                  {att.size && (
                    <span
                      className={cn(
                        "text-[10px] fa-num leading-tight",
                        inPrimaryBubble ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      {att.size}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 ms-1 shrink-0">
                  {att.url && (
                    <button
                      type="button"
                      onClick={() => downloadAttachment(att)}
                      className={cn(
                        "p-1 rounded-md transition-colors cursor-pointer",
                        inPrimaryBubble
                          ? "hover:bg-white/20 text-white"
                          : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
                      )}
                      title={isRtl ? "دانلود فایل" : "Download file"}
                    >
                      <Download className="size-3.5" />
                    </button>
                  )}
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(idx)}
                      className={cn(
                        "p-1 rounded-md transition-colors cursor-pointer",
                        inPrimaryBubble
                          ? "hover:bg-white/20 text-white"
                          : "hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                      )}
                      title={isRtl ? "حذف" : "Remove"}
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Image Preview Modal */}
        <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
          <DialogContent className="max-w-3xl p-4 overflow-hidden rounded-3xl">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-sm font-semibold truncate flex items-center justify-between gap-4">
                <span>{previewImage?.name}</span>
                {previewImage && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 rounded-xl text-xs"
                    onClick={() => downloadAttachment(previewImage)}
                  >
                    <Download className="size-3.5" />
                    <span>{isRtl ? "دانلود" : "Download"}</span>
                  </Button>
                )}
              </DialogTitle>
            </DialogHeader>
            {previewImage?.url && (
              <div className="max-h-[75vh] flex items-center justify-center bg-muted/30 rounded-2xl overflow-hidden p-2">
                <img
                  src={previewImage.url}
                  alt={previewImage.name}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-md"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Full / Card variant: used in Task Header & Task Creation
  return (
    <>
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-2.5", className)}>
        {attachments.map((att, idx) => {
          const isImg = isImageAttachment(att);
          return (
            <div
              key={att.id || idx}
              className="p-3 rounded-2xl border border-border/60 bg-background/80 hover:bg-muted/40 transition-all flex items-center justify-between gap-3 shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {isImg && att.url ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(att)}
                    className="size-10 rounded-xl overflow-hidden shrink-0 border border-border/60 bg-muted/40 cursor-pointer relative"
                    title={isRtl ? "مشاهده تصویر" : "View"}
                  >
                    <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 border border-border/40">
                    {getAttachmentIcon(att.type, att.name, "size-5")}
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-foreground truncate" title={att.name}>
                    {att.name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground fa-num">
                    {att.size && <span>{att.size}</span>}
                    {att.type && <span className="uppercase font-mono text-[10px]">({att.type})</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isImg && att.url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setPreviewImage(att)}
                    className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                    title={isRtl ? "مشاهده" : "View"}
                  >
                    <Eye className="size-4" />
                  </Button>
                )}
                {att.url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadAttachment(att)}
                    className="size-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title={isRtl ? "دانلود فایل" : "Download"}
                  >
                    <Download className="size-4" />
                  </Button>
                )}
                {onRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(idx)}
                    className="size-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title={isRtl ? "حذف پیوست" : "Remove"}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-4 overflow-hidden rounded-3xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-sm font-semibold truncate flex items-center justify-between gap-4">
              <span>{previewImage?.name}</span>
              {previewImage && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 rounded-xl text-xs"
                  onClick={() => downloadAttachment(previewImage)}
                >
                  <Download className="size-3.5" />
                  <span>{isRtl ? "دانلود" : "Download"}</span>
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewImage?.url && (
            <div className="max-h-[75vh] flex items-center justify-center bg-muted/30 rounded-2xl overflow-hidden p-2">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
