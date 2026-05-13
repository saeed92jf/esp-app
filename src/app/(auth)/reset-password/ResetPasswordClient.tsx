'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { RegisterPasswordInput, ConfirmPasswordInput } from '@/components/ui/Password'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

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
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
      
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Invalid token state
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl text-center">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-2">Invalid reset link</h2>
                  <p className="text-secondary mb-6">
                    This password reset link is invalid or has expired.
                  </p>
                  <Button variant="primary" asChild>
                    <Link href="/forgot-password">Request New Link</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl text-center">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-2">Password reset successful!</h2>
                  <p className="text-secondary mb-6">
                    Your password has been reset successfully. Redirecting to login...
                  </p>
                  <Button variant="primary" asChild>
                    <Link href="/login">Go to Login</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 group">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-inverse font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ESP<span className="text-primary">Webapp</span>
                </span>
              </Link>
              <CardTitle className="text-2xl">Create new password</CardTitle>
              <CardDescription>
                Enter your new password below.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                    <p className="text-sm text-error m-0">{error}</p>
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

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full" 
                  isLoading={isLoading} 
                  disabled={!isFormValid}
                >
                  Reset Password
                </Button>

                <p className="text-center text-sm text-secondary">
                  Remember your password?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Back to Login
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}