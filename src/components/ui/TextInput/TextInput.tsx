// components/ui/TextInput.tsx
'use client'

import { forwardRef } from 'react'
import { Input, InputProps } from '@/components/ui'

// ============================================
// TEXT INPUT COMPONENT
// Simple text input wrapper around the base Input component
// Sets type="text" by default for convenience
// Inherits all styling and props from Input component
// Uses Tailwind CSS only - no separate CSS file needed
// ============================================

export interface TextInputProps extends Omit<InputProps, 'type'> {
  // No additional props needed - all props are passed through to Input
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref) => {
    return (
      <Input 
        ref={ref} 
        type="text" 
        {...props} 
      />
    )
  }
)

TextInput.displayName = 'TextInput'