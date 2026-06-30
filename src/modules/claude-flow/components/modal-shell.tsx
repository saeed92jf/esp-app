// components/flow/ui/modal-shell.tsx
"use client";

import React, { useEffect, useRef } from "react";

interface ModalShellProps {
  onClose: () => void;
  children: React.ReactNode;
  titleId: string;
  /** Optional max-width override, defaults to max-w-md */
  maxWidth?: string;
}

// Reusable accessible modal wrapper.
// Handles: backdrop click, Escape key, initial focus, aria attributes.
export function ModalShell({
  onClose,
  children,
  titleId,
  maxWidth = "max-w-md",
}: ModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus first focusable element on mount
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
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} rounded-xl border border-border bg-background shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
}
