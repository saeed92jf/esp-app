'use client'

import { forwardRef } from 'react'
import { Input, InputProps } from '@/components/ui/Input/Input'
export interface TextInputProps extends Omit<InputProps, 'type'> {
  // No additional props needed
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref) => {
    return <Input ref={ref} type="text" {...props} />
  }
)

TextInput.displayName = 'TextInput'