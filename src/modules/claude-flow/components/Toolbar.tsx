"use client";

import React, { useRef, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save,
  FolderOpen,
  FilePlus2,
  Download,
  Upload,
  Settings2,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Globe,
  Check,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useDiagramStore } from "../store";
import { cn } from "@/lib/utils";

// ── Supported locales ─────────────────────────────────────────────────────────
const LOCALES = [
  { code: "en", label: "English" },
  { code: "fa", label: "فارسی" },
] as const;

type SupportedLocale = (typeof LOCALES)[number]["code"];

// ── Reusable toolbar button ───────────────────────────────────────────────────
// Uses semantic design tokens so it adapts to light/dark mode automatically.
function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-md transition-colors",
        "text-muted-foreground hover:bg-accent hover:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent",
        // Active state uses a subtle primary tint
        active && "bg-primary/10 text-primary hover:bg-primary/20",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

// ── Visual separator between toolbar groups ───────────────────────────────────
function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

// ── Toolbar ───────────────────────────────────
export function Toolbar({
  onOpenLibrary,
  onOpenNew,
  onSave,
  onOpenSettings,
}: {
  onOpenLibrary: () => void;
  onOpenNew: () => void;
  onSave: () => void;
  onOpenSettings: () => void;
}) {
  const t = useTranslations("Flow");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const diagramName = useDiagramStore((s) => s.diagramName);
  const setDiagramName = useDiagramStore((s) => s.setDiagramName);
  const undo = useDiagramStore((s) => s.undo);
  const redo = useDiagramStore((s) => s.redo);
  const canUndo = useDiagramStore((s) => s.canUndo());
  const canRedo = useDiagramStore((s) => s.canRedo());
  const isPalettOpen = useDiagramStore((s) => s.isPalettOpen);
  const togglePalette = useDiagramStore((s) => s.togglePalette);
  const isSettingsPanelOpen = useDiagramStore((s) => s.isSettingsPanelOpen);
  const toggleSettingsPanel = useDiagramStore((s) => s.toggleSettingsPanel);
  const exportJSON = useDiagramStore((s) => s.exportJSON);
  const importJSON = useDiagramStore((s) => s.importJSON);
  const isSaving = useDiagramStore((s) => s.isSaving);

  // ── Export diagram as downloadable JSON file ──────────────────────────────
  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagramName || "diagram"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  // ── Read selected JSON file and load into store ───────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJSON(reader.result as string);
      } catch {
        // Silently swallow invalid JSON — user will see unchanged canvas
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported if needed
    e.target.value = "";
  };

  // ── Switch locale by replacing the locale segment in the current URL ──────
  // Pathname starts with "/<locale>/...", so segments[1] is the locale code.
  const handleLocaleChange = (newLocale: SupportedLocale) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setLangMenuOpen(false);
  };

  return (
    <div className="flex h-12 items-center gap-1 border-b border-border bg-background px-2">
      {/* Toggle left palette panel */}
      <ToolbarButton
        icon={isPalettOpen ? PanelLeftClose : PanelLeft}
        label={t("palette.basic")}
        onClick={togglePalette}
      />
      <Divider />

      {/* Editable diagram name */}
      <input
        value={diagramName}
        onChange={(e) => setDiagramName(e.target.value)}
        className={cn(
          "w-44 rounded-md border border-transparent bg-transparent px-2 py-1",
          "text-sm font-medium text-foreground outline-none",
          "hover:border-input hover:bg-muted",
          "focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary",
        )}
      />
      <Divider />

      {/* File operations */}
      <ToolbarButton
        icon={FilePlus2}
        label={t("editor.newDiagram")}
        onClick={onOpenNew}
      />
      <ToolbarButton
        icon={FolderOpen}
        label={t("editor.openDiagrams")}
        onClick={onOpenLibrary}
      />
      <ToolbarButton icon={Save} label={t("editor.save")} onClick={onSave} />
      <Divider />

      {/* History */}
      <ToolbarButton
        icon={Undo2}
        label={t("toolbar.undo")}
        onClick={undo}
        disabled={!canUndo}
      />
      <ToolbarButton
        icon={Redo2}
        label={t("toolbar.redo")}
        onClick={redo}
        disabled={!canRedo}
      />
      <Divider />

      {/* Viewport controls */}
      <ToolbarButton
        icon={ZoomIn}
        label={t("toolbar.zoomIn")}
        onClick={() => zoomIn()}
      />
      <ToolbarButton
        icon={ZoomOut}
        label={t("toolbar.zoomOut")}
        onClick={() => zoomOut()}
      />
      <ToolbarButton
        icon={Maximize}
        label={t("toolbar.fitView")}
        onClick={() => fitView({ duration: 300 })}
      />
      <Divider />

      {/* Import / Export */}
      <ToolbarButton
        icon={Download}
        label={t("dialogs.exportJSON")}
        onClick={handleExport}
      />
      <ToolbarButton
        icon={Upload}
        label={t("dialogs.importJSON")}
        onClick={handleImportClick}
      />
      {/* Hidden file input — triggered programmatically by handleImportClick */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Right-side controls ─────────────────────────────────────────── */}
      <div className="ms-auto flex items-center gap-1">
        {/* Auto-save indicator — shown only while save is in progress */}
        {isSaving && (
          <span className="me-1 text-xs text-muted-foreground">
            {t("editor.saving")}
          </span>
        )}

        {/* Language switcher dropdown */}
        <div className="relative">
          {langMenuOpen && (
            <div
              // end-0 is a logical property: left-0 in RTL, right-0 in LTR
              className="absolute top-9 inset-
               z-20 w-32 rounded-md border border-border bg-popover py-1 shadow-md"
              onMouseLeave={() => setLangMenuOpen(false)}
            >
              {LOCALES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => handleLocaleChange(code)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {label}
                  {/* Checkmark for the currently active locale */}
                  {locale === code && <Check className="size-3 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editor global settings dialog */}
        <ToolbarButton
          icon={Settings2}
          label={t("editorSettings.title")}
          onClick={onOpenSettings}
        />

        {/* Toggle right settings panel */}
        <ToolbarButton
          icon={isSettingsPanelOpen ? PanelRightClose : PanelRight}
          label={t("editor.settings")}
          onClick={toggleSettingsPanel}
        />
      </div>
    </div>
  );
}
