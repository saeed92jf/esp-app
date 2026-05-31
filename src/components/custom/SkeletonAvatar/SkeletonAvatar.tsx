// components/ui/SkeletonAvatar.tsx
'use client'

import { Skeleton } from '@/components/ui'
// ============================================
// SKELETON AVATAR COMPONENT
// Pre-sized circular loading placeholders
// ============================================

interface SkeletonAvatarProps {
  /** Size variant or custom size in pixels */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
}

export function SkeletonAvatar({ size = 'md' }: SkeletonAvatarProps) {
  // Predefined size mappings
  const sizeMap = {
    xs: 24,   // 24px - extra small
    sm: 32,   // 32px - small
    md: 40,   // 40px - medium (default)
    lg: 48,   // 48px - large
    xl: 56,   // 56px - extra large
  }
  
  const pixelSize = typeof size === 'number' ? size : sizeMap[size]
  
  return (
    <Skeleton variant="circular" width={pixelSize} height={pixelSize} />
  )
}