"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, FileText, Trash2, Clock } from "lucide-react";
import { useDiagramStore } from "../store";
import { useTranslations, useLocale } from "next-intl";

// Ã¢â€â‚¬Ã¢â€â‚¬ Reusable accessible modal shell Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Handles: backdrop click to close, Escape key, focus trap (first focusable el),
// aria-modal + aria-labelledby for screen readers.
function ModalShell({
  onClose,
  children,
  titleId,
}: {
  onClose: () => void;
  children: React.ReactNode;
  titleId: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key; keep focus inside the panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Move focus into the panel on mount so keyboard nav starts correctly
  useEffect(() => {
    const first = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    first?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* stopPropagation prevents backdrop-click from firing inside the panel */}
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-border bg-background shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ NewDiagramDialog Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export function NewDiagramDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Flow");
  const newDiagram = useDiagramStore((s) => s.newDiagram);
  const setDiagramName = useDiagramStore((s) => s.setDiagramName);
  const [name, setName] = useState("");

  const handleCreate = useCallback(() => {
    newDiagram();
    // Fall back to the translated "untitled" string when the input is blank
    setDiagramName(name.trim() || t("editor.untitled"));
    onClose();
  }, [newDiagram, setDiagramName, name, t, onClose]);

  return (
    <ModalShell onClose={onClose} titleId="new-diagram-title">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2
          id="new-diagram-title"
          className="text-sm font-semibold text-foreground"
        >
          {t("dialogs.newDiagram")}
        </h2>
        <button
          onClick={onClose}
          aria-label={t("dialogs.cancel")}
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          {t("dialogs.diagramName")}
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder={t("editor.untitled")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
        <button
          onClick={onClose}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
        >
          {t("dialogs.cancel")}
        </button>
        <button
          onClick={handleCreate}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("dialogs.create")}
        </button>
      </div>
    </ModalShell>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ DiagramLibraryDialog Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export function DiagramLibraryDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Flow");
  const locale = useLocale();

  const savedDiagrams = useDiagramStore((s) => s.savedDiagrams);
  const loadDiagram = useDiagramStore((s) => s.loadDiagram);
  const deleteDiagram = useDiagramStore((s) => s.deleteDiagram);

  // null  Ã¢â€ â€™ no pending delete; string Ã¢â€ â€™ id of diagram awaiting confirmation
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Format ISO date string according to the active locale
  const formatDate = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [locale],
  );

  // Delete and clear the pending-confirm state in one step
  const handleDelete = useCallback(
    (id: string) => {
      deleteDiagram(id);
      setConfirmId(null); // prevent stale confirmId if store updates list
    },
    [deleteDiagram],
  );

  return (
    <ModalShell onClose={onClose} titleId="library-title">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2
          id="library-title"
          className="text-sm font-semibold text-foreground"
        >
          {t("editor.openDiagrams")}
        </h2>
        <button
          onClick={onClose}
          aria-label={t("dialogs.cancel")}
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Diagram list */}
      <div className="max-h-96 overflow-y-auto px-2 py-2">
        {savedDiagrams.length === 0 ? (
          // Empty state Ã¢â‚¬â€ shown when no diagrams have been saved yet
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <FileText className="size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              {t("messages.noDiagrams")}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {t("messages.createFirst")}
            </p>
          </div>
        ) : (
          savedDiagrams.map((d) => (
            <div
              key={d.id}
              className="group flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent"
            >
              {/* Load button covers the name + meta area */}
              <button
                onClick={() => {
                  loadDiagram(d.id);
                  onClose();
                }}
                className="flex flex-1 items-center gap-3 text-start"
              >
                <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {d.name}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3" />
                    {/* Date + node count separated by middle dot */}
                    {formatDate(d.updatedAt)}
                    {" Ã‚Â· "}
                    {t("messages.nodeCount", { count: d.nodes.length })}
                  </p>
                </div>
              </button>

              {/* Inline delete confirmation Ã¢â‚¬â€ replaces the trash icon on first click */}
              {confirmId === d.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="rounded-md bg-destructive px-2 py-1 text-[11px] font-medium text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("dialogs.confirm")}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent"
                  >
                    {t("dialogs.cancel")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(d.id)}
                  className="rounded p-1.5 text-muted-foreground/40 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label={t("dialogs.delete")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </ModalShell>
  );
}





