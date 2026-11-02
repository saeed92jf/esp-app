"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Check,
  X,
  Move,
  Upload,
  Palette,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (croppedDataUrl: string, backgroundColor?: string) => void;
  onSelectAnotherFile?: () => void;
  initialBackgroundColor?: string;
}

const STAGE_SIZE = 280; // Size of the crop viewport in px
const EXPORT_SIZE = 512; // High-res output square size

const CROP_BG_PRESETS = [
  { hex: "transparent", labelFa: "شفاف (بدون رنگ)", labelEn: "Transparent" },
  { hex: "#0284c7", labelFa: "آبی آسمانی", labelEn: "Sky Blue" },
  { hex: "#4f46e5", labelFa: "نیلی", labelEn: "Indigo" },
  { hex: "#7c3aed", labelFa: "بنفش", labelEn: "Purple" },
  { hex: "#059669", labelFa: "زمردی", labelEn: "Emerald" },
  { hex: "#ea580c", labelFa: "نارنجی", labelEn: "Orange" },
  { hex: "#e11d48", labelFa: "یاقوتی", labelEn: "Ruby" },
  { hex: "#1e293b", labelFa: "زغالی", labelEn: "Slate" },
  { hex: "#ffffff", labelFa: "سفید", labelEn: "White" },
];

export function AvatarCropModal({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  onSelectAnotherFile,
  initialBackgroundColor = "transparent",
}: AvatarCropModalProps) {
  const locale = useLocale();
  const isFa = locale === "fa";

  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>(initialBackgroundColor || "transparent");
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Reset transform state when modal opens or imageSrc changes
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setImageLoaded(false);
    setBgColor(initialBackgroundColor || "transparent");

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (isMounted) {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
      }
    };
    img.src = imageSrc;

    if (img.complete && img.naturalWidth) {
      if (isMounted) {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageSrc, initialBackgroundColor]);

  // Calculate base scale to make image nicely cover or fit the crop stage
  const baseScale = React.useMemo(() => {
    if (!naturalSize.width || !naturalSize.height) return 1;
    return Math.max(STAGE_SIZE / naturalSize.width, STAGE_SIZE / naturalSize.height);
  }, [naturalSize]);

  // Pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Mouse wheel zoom over stage
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(3.5, Math.max(0.5, parseFloat((prev + delta).toFixed(2)))));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Perform canvas crop and export
  const handleApply = useCallback(() => {
    if (!imageSrc || !naturalSize.width || !naturalSize.height) return;

    // Guarded render function: guarantees single execution and clean coordinate transformation
    let hasRendered = false;
    const doRender = (sourceImg: HTMLImageElement) => {
      if (hasRendered) return;
      hasRendered = true;

      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_SIZE;
      canvas.height = EXPORT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // 1. Clip canvas to circle matching circular preview
      ctx.beginPath();
      ctx.arc(EXPORT_SIZE / 2, EXPORT_SIZE / 2, EXPORT_SIZE / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // 2. Background color (supports transparent PNGs)
      if (bgColor && bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
      } else {
        ctx.clearRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
      }

      // 3. Translate to center of canvas
      ctx.translate(EXPORT_SIZE / 2, EXPORT_SIZE / 2);

      // Scale factor between stage viewport and high-res canvas
      const stageToCanvas = EXPORT_SIZE / STAGE_SIZE;

      // Apply offset FIRST so pan direction matches stage viewport exactly
      ctx.translate(offset.x * stageToCanvas, offset.y * stageToCanvas);

      // Apply user rotation around image center
      ctx.rotate((rotation * Math.PI) / 180);

      // Calculate final drawn size
      const drawWidth = naturalSize.width * baseScale * zoom * stageToCanvas;
      const drawHeight = naturalSize.height * baseScale * zoom * stageToCanvas;

      ctx.drawImage(sourceImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      // 4. Export clean PNG
      const croppedUrl = canvas.toDataURL("image/png");
      onSave(croppedUrl, bgColor);
      onClose();
    };

    // If DOM image element is ready, render immediately (avoids async duplicate event bug)
    if (imageRef.current && imageRef.current.complete && imageRef.current.naturalWidth > 0) {
      doRender(imageRef.current);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      doRender(img);
    };
    img.src = imageSrc;

    if (img.complete && img.naturalWidth > 0) {
      doRender(img);
    }
  }, [imageSrc, naturalSize, bgColor, rotation, offset, baseScale, zoom, onSave, onClose]);

  if (!isOpen) return null;

  const currentDisplayWidth = naturalSize.width * baseScale * zoom;
  const currentDisplayHeight = naturalSize.height * baseScale * zoom;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[460px] p-5 sm:p-6 rounded-3xl gap-4 bg-card/95 backdrop-blur-xl border-border/60 shadow-2xl overflow-y-auto max-h-[95vh] custom-scrollbar">
        <DialogHeader className="space-y-1 text-center sm:text-start pb-1">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            {isFa ? "تنظیم، مقیاس و کادربندی عکس" : "Adjust & Crop Profile Photo"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isFa
              ? "عکس را بکشید تا در مرکز قرار گیرد و با اسلایدر اندازه آن را در کادر تنظیم کنید."
              : "Drag to reposition and use the zoom slider to frame your face inside the circle."}
          </p>
        </DialogHeader>

        {/* ─── Interactive Crop Viewport ─────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center">
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            style={{ width: STAGE_SIZE, height: STAGE_SIZE }}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-neutral-800 touch-none select-none",
              bgColor === "transparent"
                ? "bg-[linear-gradient(45deg,#1c1917_25%,transparent_25%),linear-gradient(-45deg,#1c1917_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1c1917_75%),linear-gradient(-45deg,transparent_75%,#1c1917_75%)] bg-[size:16px_16px] bg-[#0c0a09]"
                : "bg-neutral-950",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            {/* Background Color Fill behind image (for transparent PNGs) */}
            {bgColor && bgColor !== "transparent" && (
              <div
                style={{ backgroundColor: bgColor }}
                className="absolute inset-0 pointer-events-none transition-colors duration-200"
              />
            )}

            {/* The Scalable/Draggable Image */}
            {imageLoaded && imageSrc && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: currentDisplayWidth,
                  height: currentDisplayHeight,
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  willChange: "transform",
                  transition: isDragging ? "none" : "transform 0.08s ease-out",
                }}
                className="pointer-events-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  className="size-full object-contain pointer-events-none select-none"
                />
              </div>
            )}

            {/* Circular Mask Overlay (Dark outside, transparent inside) */}
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div
                style={{ width: STAGE_SIZE - 20, height: STAGE_SIZE - 20 }}
                className="rounded-full ring-2 ring-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] relative"
              />
            </div>

            {/* Drag hint overlay */}
            <div className="pointer-events-none absolute bottom-2 start-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white/90 font-medium flex items-center gap-1 shadow-sm">
              <Move className="size-3" />
              <span>{isFa ? "برای جابجایی بکشید" : "Drag to move"}</span>
            </div>
          </div>
        </div>

        {/* ─── Controls: Zoom Slider ────────────────────────────────────── */}
        <div className="space-y-3.5">
          <div className="space-y-1.5 bg-muted/30 p-3 rounded-2xl border border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
              <span className="flex items-center gap-1">
                <ZoomOut className="size-3.5" />
                <span>{isFa ? "بزرگ‌نمایی و مقیاس:" : "Zoom & Scale:"}</span>
              </span>
              <span className="font-mono text-[11px] text-foreground font-bold" dir="ltr">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))))}
                className="size-7 rounded-lg bg-background hover:bg-muted text-foreground flex items-center justify-center border border-border/60 transition-colors cursor-pointer shrink-0"
                title={isFa ? "کوچک‌نمایی" : "Zoom out"}
              >
                <ZoomOut className="size-3.5" />
              </button>

              <Slider
                value={[zoom]}
                min={0.5}
                max={3.0}
                step={0.02}
                onValueChange={(vals) => setZoom(vals[0])}
                className="flex-1 cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3.0, parseFloat((z + 0.1).toFixed(2))))}
                className="size-7 rounded-lg bg-background hover:bg-muted text-foreground flex items-center justify-center border border-border/60 transition-colors cursor-pointer shrink-0"
                title={isFa ? "بزرگ‌نمایی" : "Zoom in"}
              >
                <ZoomIn className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Tool Buttons: Rotate & Center */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="h-8.5 px-2.5 rounded-xl text-xs gap-1.5 border-border/60 cursor-pointer"
                title={isFa ? "چرخش ۹۰ درجه" : "Rotate 90°"}
              >
                <RotateCw className="size-3.5" />
                <span>{isFa ? "چرخش" : "Rotate"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8.5 px-2.5 rounded-xl text-xs gap-1.5 border-border/60 cursor-pointer"
                title={isFa ? "تنظیم مجدد در مرکز" : "Reset & Center"}
              >
                <Maximize2 className="size-3.5" />
                <span>{isFa ? "مرکز" : "Center"}</span>
              </Button>
            </div>

            {onSelectAnotherFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSelectAnotherFile}
                className="h-8.5 px-2 rounded-xl text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Upload className="size-3.5" />
                <span>{isFa ? "انتخاب عکس دیگر..." : "Change file..."}</span>
              </Button>
            )}
          </div>

          {/* Background Color Picker for Transparent PNGs */}
          <div className="p-3 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Palette className="size-3.5 text-primary" />
                <span>{isFa ? "رنگ پس‌زمینه (مخصوص تصاویر بدون بکگراند / PNG):" : "Background Color (for transparent PNG):"}</span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                {bgColor === "transparent" ? (isFa ? "شفاف" : "Transparent") : bgColor}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {CROP_BG_PRESETS.map((preset) => {
                const isSelected = bgColor === preset.hex;
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setBgColor(preset.hex)}
                    title={isFa ? preset.labelFa : preset.labelEn}
                    style={preset.hex !== "transparent" ? { backgroundColor: preset.hex } : undefined}
                    className={cn(
                      "size-7 rounded-full flex items-center justify-center border transition-all cursor-pointer relative",
                      preset.hex === "transparent"
                        ? "bg-[linear-gradient(45deg,#d4d4d8_25%,transparent_25%),linear-gradient(-45deg,#d4d4d8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#d4d4d8_75%),linear-gradient(-45deg,transparent_75%,#d4d4d8_75%)] bg-[size:8px_8px] bg-white dark:bg-neutral-800"
                        : "border-border/60",
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-sm"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    )}
                  >
                    {isSelected && (
                      <Check className={cn("size-3.5 stroke-[3]", preset.hex === "#ffffff" ? "text-neutral-900" : "text-white")} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Modal Actions (Footer) ────────────────────────────────────── */}
        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-xs font-semibold border-border/60 cursor-pointer"
          >
            <X className="size-3.5 rtl:ml-1 ltr:mr-1" />
            <span>{isFa ? "انصراف" : "Cancel"}</span>
          </Button>

          <Button
            type="button"
            onClick={handleApply}
            className="h-10 px-5 rounded-xl text-xs font-bold bg-primary hover:opacity-95 text-primary-foreground shadow-md shadow-primary/20 gap-1.5 cursor-pointer"
          >
            <Check className="size-4" />
            <span>{isFa ? "تأیید و ذخیره عکس" : "Save & Apply"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
