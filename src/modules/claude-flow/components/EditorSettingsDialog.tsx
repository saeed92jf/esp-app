"use client";

import React from "react";
import { X, Keyboard } from "lucide-react";
import { useDiagramStore } from "../store";
import { useTranslations } from "next-intl";
import { ModalShell } from "../components/modal-shell";
import type { DiagramEdgeType, EditorSettings } from "../types";

//Ã¢â€â‚¬Ã¢â€â‚¬ Local sub-components Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

// Section heading: small caps, muted color Ã¢â‚¬â€ uses design token text-muted-foreground
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

// Label + control row Ã¢â‚¬â€ label uses muted foreground to stay secondary to content
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

// Accessible toggle switch.
// Uses bg-primary when checked and bg-input when unchecked (respects dark mode via CSS vars).
// RTL-aware: rtl:-translate-x-4 mirrors the thumb for right-to-left layouts.
function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-input"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4rtl:-translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// Generic type-safe select.
// border-input / bg-background / text-foreground follow shadcn design tokens.
function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// Keyboard shortcuts Ã¢â‚¬â€ labelKey maps to Flow.shortcuts.* in translation files
const SHORTCUT_KEYS = [
  { labelKey: "undo", combo: "Ctrl/Ã¢Å’Ëœ + Z" },
  { labelKey: "redo", combo: "Ctrl/Ã¢Å’Ëœ + Shift + Z" },
  { labelKey: "save", combo: "Ctrl/Ã¢Å’Ëœ + S" },
  { labelKey: "copy", combo: "Ctrl/Ã¢Å’Ëœ + C" },
  { labelKey: "paste", combo: "Ctrl/Ã¢Å’Ëœ + V" },
  { labelKey: "duplicate", combo: "Ctrl/Ã¢Å’Ëœ + D" },
  { labelKey: "delete", combo: "Delete" },
  { labelKey: "fitView", combo: "Right-click Ã¢â€ â€™ Fit view" },
] as const;

//Ã¢â€â‚¬Ã¢â€â‚¬ EditorSettingsDialog Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export function EditorSettingsDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Flow");
  const settings = useDiagramStore((s) => s.settings);
  const updateSettings = useDiagramStore((s) => s.updateSettings);

  // Typed partial-update helper Ã¢â‚¬â€ avoids manual casting at each call site
  const set = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K],
  ) => updateSettings({ [key]: value });

  return (
    // max-w-md panel; flex-col so the scrollable body doesn't overflow the viewport
    <ModalShell
      onClose={onClose}
      titleId="editor-settings-title"
      maxWidth="max-w-md"
    >
      <div className="flex max-h-[85vh] flex-col">
        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Header Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2
            id="editor-settings-title"
            className="text-sm font-semibold text-foreground"
          >
            {t("editorSettings.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("dialogs.cancel")}
            className="rounded p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Scrollable body Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Canvas */}
          <SectionTitle>{t("editorSettings.canvas")}</SectionTitle>
          <Row label={t("editorSettings.snapToGrid")}>
            <Switch
              checked={settings.snapToGrid}
              onChange={(v) => set("snapToGrid", v)}
            />
          </Row>
          <Row label={t("editorSettings.showMiniMap")}>
            <Switch
              checked={settings.showMiniMap}
              onChange={(v) => set("showMiniMap", v)}
            />
          </Row>
          <Row label={t("editorSettings.showControls")}>
            <Switch
              checked={settings.showControls}
              onChange={(v) => set("showControls", v)}
            />
          </Row>
          <Row label={t("editorSettings.background")}>
            <Select
              value={settings.backgroundVariant}
              onChange={(v) => set("backgroundVariant", v)}
              options={[
                { value: "dots", label: t("editorSettings.bg_dots") },
                { value: "lines", label: t("editorSettings.bg_lines") },
                { value: "cross", label: t("editorSettings.bg_cross") },
                { value: "none", label: t("editorSettings.bg_none") },
              ]}
            />
          </Row>

          <div className="my-3 h-px bg-border" />

          {/* Appearance */}
          <SectionTitle>{t("editorSettings.appearance")}</SectionTitle>
          <Row label={t("editorSettings.colorMode")}>
            <span className="text-xs text-muted-foreground">
              {settings.colorMode === "dark" ? t("editorSettings.mode_dark") : t("editorSettings.mode_light")}
              {" â€” "}
              {/* No longer a manual choice: the diagram now follows the site's
                  own dark/light setting automatically (see DiagramEditor.tsx's
                  theme-sync effect), the same way any other themed component would. */}
              synced with the site theme
            </span>
          </Row>

          <div className="my-3 h-px bg-border" />

          {/* Behavior */}
          <SectionTitle>{t("editorSettings.behavior")}</SectionTitle>
          <Row label={t("editorSettings.defaultEdgeType")}>
            <Select
              value={settings.defaultEdgeType}
              onChange={(v) => set("defaultEdgeType", v as DiagramEdgeType)}
              options={[
                { value: "default", label: t("editorSettings.edge_default") },
                { value: "straight", label: t("editorSettings.edge_straight") },
                {
                  value: "smoothstep",
                  label: t("editorSettings.edge_smoothstep"),
                },
                { value: "step", label: t("editorSettings.edge_step") },
                {
                  value: "floating",
                  label: (() => {
                    try {
                      return t("editorSettings.edge_floating");
                    } catch {
                      return "Floating";
                    }
                  })(),
                },
              ]}
            />
          </Row>
          <Row label={t("editorSettings.autoSave")}>
            <Switch
              checked={settings.autoSave}
              onChange={(v) => set("autoSave", v)}
            />
          </Row>
          <Row label="Push nodes apart while dragging">
            <Switch
              checked={settings.collisionAvoidance}
              onChange={(v) => set("collisionAvoidance", v)}
            />
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
              <div
                key={shortcut.labelKey}
                className="flex items-center justify-between text-xs"
              >
                {/* Dynamic key lookup: Flow.shortcuts.<labelKey> */}
                <span className="text-muted-foreground">
                  {t(`shortcuts.${shortcut.labelKey}`)}
                </span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {shortcut.combo}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}





