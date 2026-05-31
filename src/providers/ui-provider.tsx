// src/providers/ui-provider.tsx
'use client';
import { createContext, useContext, useState } from 'react';

interface UIState {
  sideMenuOpen: boolean;
  setSideMenuOpen: (open: boolean) => void;
  toggleSideMenu: () => void;
}
const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const toggleSideMenu = () => setSideMenuOpen((v) => !v);
  return (
    <UIContext.Provider
      value={{ sideMenuOpen, setSideMenuOpen, toggleSideMenu }}
    >
      {children}
    </UIContext.Provider>
  );
}
export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
