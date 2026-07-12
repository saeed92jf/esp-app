"use client";

import React from "react";
import { Keyboard } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDiagramStore } from "../store";
import type { DiagramEdgeType, EditorSettings } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui-custom/combobox";

// ── Local sub-components ──────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <Label className="min-w-0 flex-1 text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// Falls back to a plain-English string if a translation key hasn't been
// added to messages/*.json yet — next-intl throws on missing keys, so every
// newly-introduced string in this dialog goes through this instead of a bare t().
function safeT(t: ReturnType<typeof useTranslations>, key: string, fallback: string): string {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}

// Every connection style the app supports, kept in exactly one place so the
// Editor Settings dialog and the per-edge SettingsPanel control never drift
// apart again.
function useEdgeTypeOptions(): { value: DiagramEdgeType; label: string }[] {
  const t = useTranslations("Flow");
  return [
    { value: "default", label: safeT(t, "editorSettings.edge_default", "Curve") },
    { value: "straight", label: safeT(t, "editorSettings.edge_straight", "Straight") },
    { value: "step", label: safeT(t, "editorSettings.edge_step", "Sharp step") },
    { value: "smoothstep", label: safeT(t, "editorSettings.edge_smoothstep", "Smooth step") },
    { value: "floating", label: safeT(t, "editorSettings.edge_floating", "Floating curve") },
    { value: "floating-straight", label: safeT(t, "editorSettings.edge_floating_straight", "Floating straight") },
  ];
}

// Keyboard shortcuts — labelKey maps to Flow.shortcuts.* in translation files
const SHORTCUT_KEYS = [
  { labelKey: "undo", combo: "Ctrl/⌘ + Z" },
  { labelKey: "redo", combo: "Ctrl/⌘ + Shift + Z" },
  { labelKey: "save", combo: "Ctrl/⌘ + S" },
  { labelKey: "copy", combo: "Ctrl/⌘ + C" },
  { labelKey: "paste", combo: "Ctrl/⌘ + V" },
  { labelKey: "duplicate", combo: "Ctrl/⌘ + D" },
  { labelKey: "delete", combo: "Delete" },
  { labelKey: "fitView", combo: "Right-click → Fit view" },
] as const;

// ── EditorSettingsDialog ───────────────────────────────────────────────────
export function EditorSettingsDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Flow");
  const settings = useDiagramStore((s) => s.settings);
  const updateSettings = useDiagramStore((s) => s.updateSettings);
  const edgeTypeOptions = useEdgeTypeOptions();

  const set = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) =>
    updateSettings({ [key]: value });

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editorSettings.title")}</DialogTitle>
          <DialogDescription>
            {t("editorSettings.canvas")} · {t("editorSettings.appearance")} · {t("editorSettings.behavior")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pe-3">
          <div className="pb-2">
            {/* Canvas */}
            <SectionTitle>{t("editorSettings.canvas")}</SectionTitle>
            <Row label={t("editorSettings.snapToGrid")}>
              <Switch checked={settings.snapToGrid} onCheckedChange={(v) => set("snapToGrid", v)} />
            </Row>
            <Row label={t("editorSettings.showMiniMap")}>
              <Switch checked={settings.showMiniMap} onCheckedChange={(v) => set("showMiniMap", v)} />
            </Row>
            <Row label={t("editorSettings.showControls")}>
              <Switch checked={settings.showControls} onCheckedChange={(v) => set("showControls", v)} />
            </Row>
            <Row label={t("editorSettings.background")}>
              <Select value={settings.backgroundVariant} onValueChange={(v: any) => set("backgroundVariant", v)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dots">{t("editorSettings.bg_dots")}</SelectItem>
                  <SelectItem value="lines">{t("editorSettings.bg_lines")}</SelectItem>
                  <SelectItem value="cross">{t("editorSettings.bg_cross")}</SelectItem>
                  <SelectItem value="none">{t("editorSettings.bg_none")}</SelectItem>
                </SelectContent>
              </Select>
            </Row>

            <div className="my-3 h-px bg-border" />

            {/* Appearance */}
            <SectionTitle>{t("editorSettings.appearance")}</SectionTitle>
            <Row label={t("editorSettings.colorMode")}>
              <span className="text-xs text-muted-foreground">
                {settings.colorMode === "dark" ? t("editorSettings.mode_dark") : t("editorSettings.mode_light")}
                {" — "}
                {safeT(t, "editorSettings.colorModeNote", "synced with the site theme")}
              </span>
            </Row>

            <div className="my-3 h-px bg-border" />

            {/* Behavior */}
            <SectionTitle>{t("editorSettings.behavior")}</SectionTitle>
            <Row label={t("editorSettings.defaultEdgeType")}>
              <Combobox
                options={edgeTypeOptions}
                value={settings.defaultEdgeType}
                onChange={(v) => set("defaultEdgeType", v as DiagramEdgeType)}
                placeholder={t("settings.edgeType")}
                className="w-56"
              />
            </Row>
            <Row label={t("editorSettings.autoSave")}>
              <Switch checked={settings.autoSave} onCheckedChange={(v) => set("autoSave", v)} />
            </Row>
            <Row label={safeT(t, "editorSettings.collisionAvoidance", "Push nodes apart while dragging")}>
              <Switch checked={settings.collisionAvoidance} onCheckedChange={(v) => set("collisionAvoidance", v)} />
            </Row>

            <div className="my-3 h-px bg-border" />

            {/* Keyboard shortcuts */}
            <SectionTitle>
              <span className="flex items-center gap-1.5">
                <Keyboard className="h-3 w-3" />
                {t("editorSettings.shortcuts")}
              </span>
            </SectionTitle>
            <div className="space-y-1.5">
              {SHORTCUT_KEYS.map((shortcut) => (
                <div key={shortcut.labelKey} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t(`shortcuts.${shortcut.labelKey}`)}</span>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {shortcut.combo}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
