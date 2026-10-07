'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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

type PrimaryColorContextType = {
  colorId: PrimaryColorId;
  setColor: (id: PrimaryColorId) => void;
  presets: typeof PRIMARY_COLORS;
};

const PrimaryColorContext = createContext<PrimaryColorContextType | undefined>(undefined);

export function PrimaryColorProvider({ children }: { children: ReactNode }) {
  const [colorId, setColorId] = useState<PrimaryColorId>(DEFAULT_PRIMARY_COLOR);

  useEffect(() => {
    try {
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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GLOBAL_STORAGE_KEY && e.newValue) {
        const newColor = e.newValue as PrimaryColorId;
        if (PRIMARY_COLORS.some((c) => c.id === newColor)) {
          setColorId(newColor);
          applyColorClass(newColor);
        }
      }
    };

    const handleCustomChange = (e: CustomEvent<PrimaryColorId>) => {
      const newColor = e.detail;
      if (PRIMARY_COLORS.some((c) => c.id === newColor)) {
        setColorId(newColor);
        applyColorClass(newColor);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('esp-primary-color-change', handleCustomChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('esp-primary-color-change', handleCustomChange as EventListener);
    };
  }, []);

  const setColor = useCallback((id: PrimaryColorId) => {
    applyColorClass(id);
    setColorId(id);
    try {
      localStorage.setItem(GLOBAL_STORAGE_KEY, id);
    } catch {}
    // Dispatch custom event for other listeners in the same window
    window.dispatchEvent(new CustomEvent('esp-primary-color-change', { detail: id }));
  }, []);

  return (
    <PrimaryColorContext.Provider value={{ colorId, setColor, presets: PRIMARY_COLORS }}>
      {children}
    </PrimaryColorContext.Provider>
  );
}

export function usePrimaryColor() {
  const context = useContext(PrimaryColorContext);
  if (!context) {
    throw new Error('usePrimaryColor must be used within a PrimaryColorProvider');
  }
  return context;
}
