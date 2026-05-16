// components/ui/SkeletonText.tsx
'use client'

import { Skeleton } from '@/components/ui'
// ============================================
// SKELETON TEXT COMPONENT
// Quick loading placeholder for text blocks
// ============================================

interface SkeletonTextProps {
  /** Number of text lines to display */
  lines?: number
  /** Custom width for all lines (last line will be 80%) */
  width?: string
  /** Additional custom classes */
  className?: string
}

export function SkeletonText({ lines = 3, width = '100%', className }: SkeletonTextProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? '80%' : width}
          height={16}
          className={className}
        />
      ))}
    </div>
  )
}