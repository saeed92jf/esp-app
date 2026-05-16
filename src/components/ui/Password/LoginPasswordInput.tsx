// components/ui/LoginPasswordInput.tsx
'use client'

import { forwardRef } from 'react'
import { BasePasswordInput, BasePasswordInputProps } from './BasePasswordInput'

// ============================================
// LOGIN PASSWORD INPUT COMPONENT
// Simplified password input for login forms
// Wraps BasePasswordInput with showStrength=false by default
// No strength meter - suitable for login/authentication
// Uses Tailwind CSS only - inherits all styles from BasePasswordInput
// ============================================

export const LoginPasswordInput = forwardRef<HTMLInputElement, Omit<BasePasswordInputProps, 'showStrength'>>(
  (props, ref) => {
    return (
      <BasePasswordInput 
        ref={ref} 
        {...props} 
        showStrength={false} 
      />
    )
  }
)

LoginPasswordInput.displayName = 'LoginPasswordInput'