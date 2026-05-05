'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { RegisterPasswordInput, ConfirmPasswordInput } from '@/components/ui/Password'

export function ResetPasswordClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [isConfirmValid, setIsConfirmValid] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isFormValid = isPasswordValid && isConfirmValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError('')

    try {
      // API call for reset password
      // await authApi.resetPassword({ token, password })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubmitted(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="hero min-h-screen">
        <div className="container">
          <div className="max-w-md mx-auto">
            <div className="card shadow-xl animate-fade-in text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="mb-2">Invalid reset link</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This password reset link is invalid or has expired.
                </p>
                <Link href="/forgot-password" className="btn btn-primary btn-md">
                  Request New Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="hero min-h-screen">
        <div className="container">
          <div className="max-w-md mx-auto">
            <div className="card shadow-xl animate-fade-in text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="mb-2">Password reset successful!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your password has been reset successfully. Redirecting to login...
                </p>
                <Link href="/login" className="btn btn-primary btn-md">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hero min-h-screen">
      <div className="container">
        <div className="max-w-md mx-auto">
          <div className="card shadow-xl animate-fade-in">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ESP<span className="text-primary">Webapp</span>
                </span>
              </Link>
              <h1 className="mb-2">Create new password</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="form-error-box p-3 bg-danger/10 border border-danger/20 rounded-lg">
                  <p className="form-error m-0">{error}</p>
                </div>
              )}

              <RegisterPasswordInput
                label="New Password"
                placeholder="Enter new password"
                value={password}
                onChange={(val, isValid) => {
                  setPassword(val)
                  setIsPasswordValid(isValid || false)
                }}
                required
              />

              <ConfirmPasswordInput
                label="Confirm New Password"
                placeholder="Confirm your new password"
                passwordValue={password}
                onChange={(val, isValid) => {
                  setConfirmPassword(val)
                  setIsConfirmValid(isValid)
                }}
                required
              />

              <Button type="submit" variant="primary" fullWidth isLoading={isLoading} disabled={!isFormValid}>
                Reset Password
              </Button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Back to Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}