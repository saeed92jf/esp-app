'use client'

import { forwardRef } from 'react'
import { BasePasswordInput, BasePasswordInputProps } from './BasePasswordInput'

export const LoginPasswordInput = forwardRef<HTMLInputElement, Omit<BasePasswordInputProps, 'showStrength'>>(
  (props, ref) => {
    return <BasePasswordInput ref={ref} {...props} showStrength={false} />
  }
)

LoginPasswordInput.displayName = 'LoginPasswordInput'