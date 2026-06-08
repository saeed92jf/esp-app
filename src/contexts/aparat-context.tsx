// src/contexts/aparat-context.tsx
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  useAparatChannel,
  type UseAparatChannelResult,
} from '@/hooks/use-aparat-channel';

// Single distribution channel for all Aparat data. Null means "no provider
// mounted yet", which we treat as a hard developer error below.
const AparatContext = createContext<UseAparatChannelResult | null>(null);

interface AparatProviderProps {
  // The channel username drives every downstream fetch in the hook.
  username: string;
  children: ReactNode;
}

/**
 * Mounts a SINGLE instance of useAparatChannel and shares its full result
 * with the entire subtree. Every component reads from here, so there is
 * exactly one fetch/pagination source for the whole feature.
 */
export function AparatProvider({ username, children }: AparatProviderProps) {
  // One hook instance => one stream, one cache, one selected video.
  const value = useAparatChannel(username);

  return (
    <AparatContext.Provider value={value}>{children}</AparatContext.Provider>
  );
}

/**
 * Typed accessor for the shared Aparat data. Throws when used outside the
 * provider so misuse fails loudly during development instead of silently
 * returning undefined.
 */
export function useAparat(): UseAparatChannelResult {
  const ctx = useContext(AparatContext);

  if (ctx === null) {
    throw new Error('useAparat() must be used inside an <AparatProvider>.');
  }

  return ctx;
}
