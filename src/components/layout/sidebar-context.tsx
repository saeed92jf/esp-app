// src/components/layout/sidebar-context.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// Control surface shared between the header button and the sidebar panel.
interface SidebarContextValue {
  isOpen: boolean; // current visibility of the side menu
  toggle: () => void; // flip open/close
  open: () => void; // force open
  close: () => void; // force close
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Returns null outside a provider so the header can still render on public
// pages that don't have a sidebar.
export function useSidebar(): SidebarContextValue | null {
  return useContext(SidebarContext);
}
