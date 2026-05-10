// modules/auth/components/RegisterClient.tsx (کد اصلاح شده)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'  // اضافه کردن
import Link from 'next/link'
import { Button, EmailInput, Input } from '@/components/ui'
import { RegisterPasswordInput, ConfirmPasswordInput } from '@/components/ui/Password'

export function RegisterClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [isConfirmValid, setIsConfirmValid] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isFormValid = name && email && isPasswordValid && isConfirmValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError('')

    try {
      // TODO: بعداً با API واقعی جایگزین می‌شود
      // فعلاً فقط شبیه‌سازی می‌کنیم
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // بعد از ثبت‌نام، کاربر را لاگین کن
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Registration successful but auto-login failed. Please login manually.')
        router.push('/login')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // ... باقی کد همین‌طور保持不变 (همون JSX خودت)
    <div className="hero min-h-screen">
      {/* ... */}
    </div>
  )
}