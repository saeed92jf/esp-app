// src/components/features/search/site-search.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Google-Style Site Search Component

'use client';

import React from 'react';
import { GoogleSearchBox } from './GoogleSearchBox';

export function SiteSearch({
  className,
  onOpenChange,
  onOverviewClick,
  placeholder,
}: {
  className?: string;
  onOpenChange?: (open: boolean) => void;
  onOverviewClick?: () => void;
  placeholder?: string;
}) {
  return (
    <GoogleSearchBox
      className={className}
      onOpenChange={onOpenChange}
      onOverviewClick={onOverviewClick}
      placeholder={placeholder}
    />
  );
}

export { GoogleSearchBox };
