// components/ui/SkeletonCard.tsx
'use client'

import { Skeleton } from '@/components/ui'
import { cn } from '@/lib/cn'

// ============================================
// SKELETON CARD COMPONENT
// Pre-built loading placeholder for card layouts
// Matches typical card structure: avatar, title, description, actions
// ============================================

interface SkeletonCardProps {
  /** Number of action buttons to show at bottom */
  actions?: number
  /** Whether to show avatar section */
  showAvatar?: boolean
  /** Number of description lines */
  descriptionLines?: number
}

export function SkeletonCard({ 
  actions = 2, 
  showAvatar = true, 
  descriptionLines = 3 
}: SkeletonCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      {/* Header section with optional avatar */}
      {showAvatar && (
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1">
            <Skeleton width="60%" height={20} className="mb-2" />
            <Skeleton width="40%" height={16} />
          </div>
        </div>
      )}
      
      {/* Content section with description lines */}
      <div className={cn('space-y-2', showAvatar && 'mt-4')}>
        <Skeleton lines={descriptionLines} />
      </div>
      
      {/* Action buttons section */}
      {actions > 0 && (
        <div className="mt-4 flex gap-2">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton key={i} width={80} height={36} rounded="lg" />
          ))}
        </div>
      )}
    </div>
  )
}