// src/modules/diagram-editor/components/Header/DiagramNameEditor.tsx
// Inline editable diagram name with click-to-edit behavior.
// Displays the current diagram name and allows renaming via input.

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDiagramStore } from "../../store/diagramStore";

export const DiagramNameEditor: React.FC = () => {
  const { diagramName, setDiagramName, isDirty } = useDiagramStore();
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(diagramName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state when store name changes externally
  useEffect(() => {
    if (!isEditing) {
      setLocalName(diagramName);
    }
  }, [diagramName, isEditing]);

  // Auto-focus and select all text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setLocalName(diagramName);
    setIsEditing(true);
  };

  const handleCommit = () => {
    const trimmed = localName.trim();
    if (trimmed) {
      setDiagramName(trimmed);
    } else {
      setLocalName(diagramName); // revert if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommit();
    } else if (e.key === "Escape") {
      setLocalName(diagramName);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className="px-2 py-0.5 text-sm font-medium rounded border border-ring
                     bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring
                     min-w-[120px] max-w-[300px]"
          aria-label="نام دیاگرام"
          maxLength={80}
        />
      ) : (
        <button
          onClick={handleStartEdit}
          className="flex items-center gap-1 px-2 py-0.5 rounded
                     text-sm font-medium text-foreground truncate max-w-[300px]
                     hover:bg-accent hover:text-accent-foreground transition-colors"
          title="کلیک برای ویرایش نام"
          aria-label={`نام دیاگرام: ${diagramName}. کلیک برای ویرایش`}
        >
          <span className="truncate">{diagramName}</span>
          {/* Dirty indicator dot */}
          {isDirty && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
              aria-label="تغییرات ذخیره نشده"
              title="تغییرات ذخیره نشده"
            />
          )}
          {/* Edit pencil icon */}
          <svg
            className="w-3 h-3 text-muted-foreground shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
