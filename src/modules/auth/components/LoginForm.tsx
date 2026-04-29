'use client'

import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginSchema, type LoginFormData } from '../schemas/auth.schema'
import { useAuth } from '../hooks/useAuth'
import { EmailInput } from '@/components/ui'
import { PasswordInput } from '@/components/ui'
import { Button } from '@/components/ui'

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading, isAuthenticated } = useAuth()
  const [error, setError] = useState<string>('')
  const [rememberMe, setRememberMe] = useState(false)

 
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard...')
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { handleSubmit } = methods

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form submitted:', data)
    setError('')
    
    const result = await login(data)
    console.log('Login result:', result)
    
    if (result.success) {
      console.log('Login successful, useEffect will redirect...')
      // redirect در useEffect انجام می‌شود
    } else {
      setError(result.error || 'Invalid email or password')
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <EmailInput
            name="email"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <PasswordInput
            name="password"
            placeholder="••••••"
            showStrength={false}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          Sign In
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔐 Demo: test@example.com / 123456
          </p>
        </div>
      </form>
    </FormProvider>
  )
}