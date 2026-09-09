// src/hooks/use-primary-color.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_PRIMARY_COLOR,
  PRIMARY_COLORS,
  type PrimaryColorId,
} from '@/config/settings';

const GLOBAL_STORAGE_KEY = 'esp-global-primary-color';
const ALL_COLOR_CLASSES = PRIMARY_COLORS.map((c) => `primary-color-${c.id}`);

function applyColorClass(id: PrimaryColorId) {
  const root = document.documentElement;
  root.classList.remove(...ALL_COLOR_CLASSES);
  root.classList.add(`primary-color-${id}`);
}

export function usePrimaryColor() {
  const [colorId, setColorId] = useState<PrimaryColorId>(DEFAULT_PRIMARY_COLOR);

  useEffect(() => {
    try {
      // Fake API read: treating local storage as the global backend state
      const stored = localStorage.getItem(GLOBAL_STORAGE_KEY) as PrimaryColorId;
      if (stored && PRIMARY_COLORS.some((c) => c.id === stored)) {
        setColorId(stored);
        applyColorClass(stored);
      } else {
        applyColorClass(DEFAULT_PRIMARY_COLOR);
      }
    } catch {
      applyColorClass(DEFAULT_PRIMARY_COLOR);
    }
  }, []);

  const setColor = useCallback((id: PrimaryColorId) => {
    applyColorClass(id);
    setColorId(id);
    try {
      // Fake API update: save to global mock state
      localStorage.setItem(GLOBAL_STORAGE_KEY, id);
    } catch {}
  }, []);

  return { colorId, setColor, presets: PRIMARY_COLORS } as const;
}
