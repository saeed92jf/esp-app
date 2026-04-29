'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerSchema, type RegisterFormData } from '@/modules/auth/schemas/auth.schema'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { EmailInput } from '@/components/ui'
import { PasswordInput } from '@/components/ui'
import { Button } from '@/components/ui'

export function RegisterClient() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuth()
  const [error, setError] = useState<string>('')

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { handleSubmit, watch } = methods

  const onSubmit = async (data: RegisterFormData) => {
    setError('')
    const result = await registerUser(data)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">
              ESP<span className="text-blue-600">Webapp</span>
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Start your journey with ESP Webapp
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...methods.register('name')}
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {methods.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-500">{methods.formState.errors.name.message}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <EmailInput name="email" placeholder="you@example.com" />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <PasswordInput name="password" placeholder="••••••" showStrength={true} />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <PasswordInput name="confirmPassword" placeholder="••••••" showStrength={false} />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full">
                Create Account
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}