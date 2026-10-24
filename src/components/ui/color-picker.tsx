"use client";

import React, { useState, useEffect, useMemo } from "react";
import { HexColorPicker } from "react-colorful";
import { useTranslations } from "next-intl";
import { Check, Copy, RotateCcw, Palette, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ColorPreset {
  hex: string;
  key?: string;
  label?: string;
}

export interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  presets?: ColorPreset[];
  className?: string;
  title?: string;
  showSaveButton?: boolean;
  onSave?: (hex: string) => void;
  onCancel?: () => void;
}

const DEFAULT_PRESETS: ColorPreset[] = [
  { hex: "#0284c7", key: "sky" },
  { hex: "#4f46e5", key: "indigo" },
  { hex: "#7c3aed", key: "purple" },
  { hex: "#059669", key: "emerald" },
  { hex: "#0d9488", key: "teal" },
  { hex: "#d97706", key: "amber" },
  { hex: "#e11d48", key: "rose" },
  { hex: "#ea580c", key: "orange" },
  { hex: "#475569", key: "slate" },
  { hex: "#1e293b", key: "darkSlate" },
];

export function ColorPicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className,
  title,
  showSaveButton = true,
  onSave,
  onCancel,
}: ColorPickerProps) {
  const t = useTranslations("ColorPicker");
  const tColors = useTranslations("Profile.avatarColors");

  // Keep local draft state so parent background doesn't mutate in real time
  const [draftColor, setDraftColor] = useState<string>(value || "#0284c7");
  const [hexInput, setHexInput] = useState<string>(value || "#0284c7");
  const [copied, setCopied] = useState(false);

  // Sync draft if external value changes (e.g. initial load or profile refresh)
  useEffect(() => {
    if (value) {
      setDraftColor(value);
      setHexInput(value);
    }
  }, [value]);

  const isValidHex = (hex: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  };

  const handlePickerChange = (newColor: string) => {
    setDraftColor(newColor);
    setHexInput(newColor);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!input.startsWith("#")) {
      input = "#" + input;
    }
    setHexInput(input);
    if (isValidHex(input)) {
      setDraftColor(input);
    }
  };

  const handlePresetClick = (hex: string) => {
    setDraftColor(hex);
    setHexInput(hex);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftColor);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setDraftColor(value);
    setHexInput(value);
    if (onCancel) onCancel();
  };

  const handleApply = () => {
    onChange(draftColor);
    if (onSave) onSave(draftColor);
    toast.success(t("colorApplied"));
  };

  const hasChanged = useMemo(() => {
    return draftColor.toLowerCase() !== (value || "").toLowerCase();
  }, [draftColor, value]);

  return (
    <div
      className={cn(
        "shadcn-color-picker w-full max-w-md bg-card border border-border/70 rounded-3xl p-5 sm:p-6 shadow-lg space-y-5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div>
          <h4 className="text-base sm:text-lg font-bold text-foreground">
            {title || t("title")}
          </h4>
        </div>

        {/* Live Swatches: Current vs Draft */}
        <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-2xl border border-border/50">
          {/* Current Saved Color */}
          <div className="flex flex-col items-center">
            <div
              style={{ backgroundColor: value || "#0284c7" }}
              className="size-7 rounded-xl shadow-xs border border-white/20"
              title={t("current")}
            />
            <span className="text-[9px] text-muted-foreground mt-0.5 font-sans">
              {t("currentShort")}
            </span>
          </div>

          <span className="text-muted-foreground text-xs font-mono">→</span>

          {/* Draft Selected Color */}
          <div className="flex flex-col items-center">
            <div
              style={{ backgroundColor: draftColor }}
              className="size-7 rounded-xl shadow-sm border-2 border-primary ring-2 ring-primary/20 transition-colors"
              title={t("draft")}
            />
            <span className="text-[9px] font-bold text-primary mt-0.5 font-sans">
              {t("draftShort")}
            </span>
          </div>
        </div>
      </div>

      {/* React-Colorful Interactive Saturation & Hue Box */}
      <div className="w-full relative">
        <HexColorPicker
          color={draftColor}
          onChange={handlePickerChange}
          className="w-full"
        />
      </div>

      {/* Hex Code Input with Copy Button */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground">
          {t("hexInput")}
        </Label>
        <div className="relative flex items-center">
          <div
            style={{ backgroundColor: draftColor }}
            className="absolute start-2.5 size-5 rounded-md shadow-xs border border-border/50"
          />
          <Input
            value={hexInput}
            onChange={handleHexInputChange}
            dir="ltr"
            maxLength={7}
            className="ps-10 pe-10 font-mono text-sm tracking-wider h-10 rounded-xl bg-muted/20 border-border/60 uppercase"
            placeholder="#0284C7"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="absolute end-2 size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            title={t("copyHex")}
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Preset Swatches Palette */}
      {presets && presets.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground">
              {t("paletteTitle")}
            </Label>
            <span className="text-[10px] text-muted-foreground">
              {presets.length} {t("colorsCount")}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {presets.map((preset) => {
              const isSelected =
                draftColor.toLowerCase() === preset.hex.toLowerCase();
              const label =
                preset.key
                  ? tColors(preset.key)
                  : preset.label || preset.hex;

              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handlePresetClick(preset.hex)}
                  title={label}
                  className={cn(
                    "size-8 rounded-full transition-all outline-none cursor-pointer flex items-center justify-center relative",
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-card shadow-md"
                      : "opacity-80 hover:opacity-100 hover:ring-2 hover:ring-muted-foreground/30 shadow-xs"
                  )}
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && (
                    <span className="size-2 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons: Cancel/Reset & Save */}
      {showSaveButton && (
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanged}
            className="h-9 text-xs font-semibold gap-1.5 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("reset")}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={!hasChanged}
            className="h-9 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl gap-1.5 transition-all"
          >
            <Check className="size-3.5 stroke-[2.5]" />
            <span>{t("saveColor")}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
