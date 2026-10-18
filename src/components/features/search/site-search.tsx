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
  showAiModeButton = true,
  showClearButton = false,
}: {
  className?: string;
  onOpenChange?: (open: boolean) => void;
  onOverviewClick?: () => void;
  placeholder?: string;
  showAiModeButton?: boolean;
  showClearButton?: boolean;
}) {
  return (
    <GoogleSearchBox
      className={className}
      onOpenChange={onOpenChange}
      onOverviewClick={onOverviewClick}
      placeholder={placeholder}
      compact={false}
      showAiModeButton={showAiModeButton}
      showClearButton={showClearButton}
    />
  );
}

export { GoogleSearchBox };
