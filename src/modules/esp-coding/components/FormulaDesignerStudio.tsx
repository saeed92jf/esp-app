"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Settings2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Send,
  Eye,
  Sliders,
  Code2,
  AlertCircle,
  Copy,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EspCodingClientService } from "../services/esp-coding.service";
import { CodingEngineService } from "../services/coding-engine.service";
import {
  CodingFormulaProfile,
  CodingFormulaVersion,
  CodingFormulaSegmentConfig,
  SeparatorType,
} from "../types";

export function FormulaDesignerStudio() {
  const t = useTranslations("espCoding.formulaDesigner");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [profiles, setProfiles] = useState<CodingFormulaProfile[]>([]);
  const [versions, setVersions] = useState<CodingFormulaVersion[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [activeVersion, setActiveVersion] = useState<CodingFormulaVersion | null>(null);

  // Editable Draft state
  const [segments, setSegments] = useState<CodingFormulaSegmentConfig[]>([]);
  const [separator, setSeparator] = useState<SeparatorType>("none");
  const [customSeparator, setCustomSeparator] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Live sample attributes for instant preview
  const [sampleAttributes, setSampleAttributes] = useState<Record<string, string>>({
    ESP_Code: "E",
    Production_Code: "1",
    Internal_Product_Code: "1",
    Product_Type_Code: "01",
    Shape_Code: "1",
    Type_Code: "01",
    Lift_Size_Code: "01",
    Thk_Code: "1",
    Basic_Material_Code: "1",
    Sub_Material_Code: "1",
    GROUP_MAT_Code1: "1",
    SPEC_Code: "03",
    GRADE_Code: "01",
    CLASS_Code: "1",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await EspCodingClientService.getProfilesAndVersions();
      setProfiles(res.profiles);
      setVersions(res.versions);

      const defaultProf = res.profiles[0];
      if (defaultProf) {
        setSelectedProfileId(defaultProf.profileId);
        const ver = res.versions.find((v) => v.versionId === defaultProf.activeVersionId) || res.versions[0];
        if (ver) {
          setActiveVersion(ver);
          setSegments([...ver.segments]);
          setSeparator(ver.separator);
          setCustomSeparator(ver.customSeparator || "");
        }
      }
    } catch (err) {
      console.error("Failed to load formula data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileChange = (profId: string) => {
    setSelectedProfileId(profId);
    const profile = profiles.find((p) => p.profileId === profId);
    if (!profile) return;
    const ver = versions.find((v) => v.versionId === profile.activeVersionId) ||
      versions.find((v) => v.profileId === profId);
    if (ver) {
      setActiveVersion(ver);
      setSegments([...ver.segments]);
      setSeparator(ver.separator);
      setCustomSeparator(ver.customSeparator || "");
    }
  };

  // Move Segment Up
  const moveSegmentUp = (idx: number) => {
    if (idx === 0) return;
    const copy = [...segments];
    const temp = copy[idx - 1];
    copy[idx - 1] = copy[idx];
    copy[idx] = temp;
    // update positions
    copy.forEach((s, i) => (s.position = i));
    setSegments(copy);
  };

  // Move Segment Down
  const moveSegmentDown = (idx: number) => {
    if (idx === segments.length - 1) return;
    const copy = [...segments];
    const temp = copy[idx + 1];
    copy[idx + 1] = copy[idx];
    copy[idx] = temp;
    copy.forEach((s, i) => (s.position = i));
    setSegments(copy);
  };

  // Toggle Segment enabled/disabled
  const toggleSegment = (idx: number) => {
    const copy = [...segments];
    copy[idx] = { ...copy[idx], enabled: !copy[idx].enabled };
    setSegments(copy);
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setDragOverIdx(idx);
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const copy = [...segments];
    const [movedItem] = copy.splice(draggedIdx, 1);
    copy.splice(targetIdx, 0, movedItem);

    // update position property
    copy.forEach((s, i) => (s.position = i));
    setSegments(copy);
    setDraggedIdx(null);
    setDragOverIdx(null);
    toast.success(isRtl ? "ترتیب سگمنت‌ها به‌روزرسانی شد" : "Segment order updated");
  };

  // Calculate Live Preview using centralized CodingEngine
  const previewResult = React.useMemo(() => {
    if (!activeVersion) return null;
    const tempVersion: CodingFormulaVersion = {
      ...activeVersion,
      segments,
      separator,
      customSeparator,
    };
    return CodingEngineService.generateCode(tempVersion, sampleAttributes);
  }, [activeVersion, segments, separator, customSeparator, sampleAttributes]);

  // Save Draft
  const handleSaveDraft = async () => {
    if (!activeVersion) return;
    try {
      setIsSubmitting(true);
      await EspCodingClientService.updateVersion(activeVersion.versionId, {
        segments,
        separator,
        customSeparator,
      });
      toast.success(t("draftSaved"));
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit for Approval
  const handleSubmitApproval = async () => {
    if (!activeVersion) return;
    try {
      setIsSubmitting(true);
      // First save current segments
      await EspCodingClientService.updateVersion(activeVersion.versionId, {
        segments,
        separator,
        customSeparator,
      });
      // Then submit for approval
      await EspCodingClientService.processApprovalAction({
        versionId: activeVersion.versionId,
        action: "submit",
      });
      toast.success(t("submittedSuccess"));
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit for approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Settings2 className="size-5 text-primary" />
            <span>{t("title")}</span>
          </h1>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Profile Selector */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            {t("selectProfile")}:
          </Label>
          <Select value={selectedProfileId} onValueChange={handleProfileChange}>
            <SelectTrigger className="h-9 w-64 rounded-xl text-xs bg-background">
              <SelectValue placeholder="Select Profile" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.profileId} value={p.profileId} className="text-xs">
                  {isRtl ? p.nameFa : p.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3-Part Layout: Segments List (7 cols) + Configuration & Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Segments Sequence & Ordering (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="p-5 rounded-2xl border-border/50 bg-card shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <span>{t("arrangedSegments")} ({segments.length})</span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                {t("dragHint")}
              </span>
            </div>

            {/* Segment Items List with Drag & Drop + Up/Down buttons */}
            <div className="flex flex-col gap-2">
              {segments.map((seg, idx) => {
                const isDragging = draggedIdx === idx;
                const isDragOver = dragOverIdx === idx;

                return (
                  <div
                    key={seg.segmentId}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDrop(idx)}
                    className={cn(
                      "p-3 rounded-xl border flex items-center justify-between gap-3 transition-all select-none",
                      seg.enabled
                        ? "bg-background border-border/60 shadow-2xs"
                        : "bg-muted/40 border-dashed border-border/40 opacity-60",
                      isDragging && "opacity-40 border-primary scale-[0.99]",
                      isDragOver && "border-primary bg-primary/5 ring-2 ring-primary/20",
                      "hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 -ms-1 text-muted-foreground/60 hover:text-foreground rounded transition-colors"
                        title={isRtl ? "برای تغییر ترتیب درگ کنید" : "Drag to reorder"}
                      >
                        <GripVertical className="size-4" />
                      </div>
                      <span className="size-6 rounded-md bg-muted text-muted-foreground font-mono text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground truncate">
                            {isRtl ? seg.labelFa : seg.labelEn}
                          </span>
                          <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                            {seg.fieldKey}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {seg.minLen ? `Length: ${seg.minLen}` : "Variable length"}
                          {seg.paddingChar && ` • Pad: '${seg.paddingChar}' (${seg.paddingDirection})`}
                          {seg.required ? " • Required" : " • Optional"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0}
                        onClick={() => moveSegmentUp(idx)}
                        className="size-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === segments.length - 1}
                        onClick={() => moveSegmentDown(idx)}
                        className="size-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant={seg.enabled ? "outline" : "ghost"}
                        size="sm"
                        onClick={() => toggleSegment(idx)}
                        className={cn(
                          "h-7 px-2 text-[10px] font-semibold rounded-lg ms-1 cursor-pointer",
                          seg.enabled
                            ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "text-muted-foreground"
                        )}
                      >
                        {seg.enabled ? (isRtl ? "فعال" : "Enabled") : (isRtl ? "غیرفعال" : "Disabled")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Separator Settings, Live Preview & Action Buttons (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
          {/* Separator Controls Card */}
          <Card className="p-5 rounded-2xl border-border/50 bg-card shadow-xs flex flex-col gap-3.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-2 border-b border-border/30 pb-2.5">
              <Sliders className="size-4 text-primary" />
              <span>{isRtl ? "تنظیمات جداکننده فرمول" : "Separator Configuration"}</span>
            </span>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("separatorLabel")}
              </Label>
              <Select value={separator} onValueChange={(val: any) => setSeparator(val)}>
                <SelectTrigger className="h-9 rounded-xl text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">{t("separatorNone")}</SelectItem>
                  <SelectItem value="hyphen" className="text-xs">{t("separatorHyphen")}</SelectItem>
                  <SelectItem value="underscore" className="text-xs">{t("separatorUnderscore")}</SelectItem>
                  <SelectItem value="dot" className="text-xs">{t("separatorDot")}</SelectItem>
                  <SelectItem value="slash" className="text-xs">{t("separatorSlash")}</SelectItem>
                  <SelectItem value="custom" className="text-xs">{t("separatorCustom")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {separator === "custom" && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  {isRtl ? "کاراکتر جداکننده سفارشی" : "Custom Separator Character"}
                </Label>
                <Input
                  type="text"
                  maxLength={5}
                  value={customSeparator}
                  onChange={(e) => setCustomSeparator(e.target.value)}
                  placeholder="e.g. -"
                  className="h-9 rounded-xl text-xs bg-background font-mono"
                />
              </div>
            )}
          </Card>

          {/* Live Preview Card */}
          <Card className="p-5 rounded-2xl border-primary/30 bg-primary/5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-primary/15 pb-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                <span>{t("livePreview")}</span>
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-background">
                {activeVersion?.versionNumber ? `v${activeVersion.versionNumber}` : "v1.0"}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border/60 shadow-2xs flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                {t("sampleOutput")}
              </span>
              <span className="text-lg sm:text-xl font-mono font-black text-primary tracking-wider break-all">
                {previewResult?.code || "—"}
              </span>
            </div>

            {/* Segment Breakdown in preview */}
            <div className="flex flex-wrap gap-1">
              {(previewResult?.segments || []).map((seg) => (
                <span
                  key={seg.segmentId}
                  className="px-2 py-0.5 rounded bg-background border border-border/50 text-[10px] font-mono"
                >
                  {seg.formattedValue || "—"}
                </span>
              ))}
            </div>

            {/* Actions: Save Draft & Submit */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border/30">
              <Button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl font-bold text-xs gap-2 cursor-pointer bg-primary text-primary-foreground shadow-xs"
              >
                <Save className="size-4" />
                <span>{t("saveDraftBtn")}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSubmitApproval}
                disabled={isSubmitting}
                className="w-full h-9 rounded-xl font-semibold text-xs gap-2 cursor-pointer bg-background"
              >
                <Send className="size-3.5" />
                <span>{t("submitApprovalBtn")}</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
