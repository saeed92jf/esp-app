// modules/auth/components/ResetPasswordClient.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/Button'
import { RegisterPasswordInput, ConfirmPasswordInput } from '@/components/ui/Password'

// ============================================
// RESET PASSWORD CLIENT COMPONENT
// Password reset form with token validation
// Shows success message on completion
// Uses Tailwind CSS - no separate CSS file needed
// ============================================

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
      // Simulate API call
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
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center justify-center gap-2 group">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-inverse font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ESP<span className="text-primary">Webapp</span>
                </span>
              </Link>
            </div>

            {/* Invalid Token Card */}
            <div className="bg-primary rounded-2xl shadow-xl border border-light overflow-hidden text-center">
              <div className="p-8">
                <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-10 h-10 text-error" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">Invalid reset link</h2>
                <p className="text-secondary mb-8">
                  This password reset link is invalid or has expired.
                </p>
                <Button variant="primary" asChild size="lg">
                  <Link href="/forgot-password">Request New Link</Link>
                </Button>
              </div>
            </div>
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
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center justify-center gap-2 group">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-inverse font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ESP<span className="text-primary">Webapp</span>
                </span>
              </Link>
            </div>

            {/* Success Card */}
            <div className="bg-primary rounded-2xl shadow-xl border border-light overflow-hidden text-center">
              <div className="p-8">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">Password reset successful!</h2>
                <p className="text-secondary mb-8">
                  Your password has been reset successfully. Redirecting to login...
                </p>
                <Button variant="primary" asChild size="lg">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            </div>
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
          {/* Logo Section */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center gap-2 group">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-inverse font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                ESP<span className="text-primary">Webapp</span>
              </span>
            </Link>
          </div>

          {/* Reset Password Form Card */}
          <div className="bg-primary rounded-2xl shadow-xl border border-light overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center border-b border-light">
              <h1 className="text-2xl font-bold text-primary mb-1">Create new password</h1>
              <p className="text-sm text-secondary">Enter your new password below.</p>
            </div>

            {/* Form Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                    <p className="text-sm text-error m-0 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-error" />
                      {error}
                    </p>
                  </div>
                )}

                {/* New Password Input */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    New Password
                  </label>
                  <RegisterPasswordInput
                    placeholder="Enter new password"
                    value={password}
                    onChange={(val, isValid) => {
                      setPassword(val)
                      setIsPasswordValid(isValid || false)
                    }}
                    required
                    inputSize="md"
                    radius="lg"
                    className="w-full"
                  />
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Confirm New Password
                  </label>
                  <ConfirmPasswordInput
                    placeholder="Confirm your new password"
                    passwordValue={password}
                    onChange={(val, isValid) => {
                      setConfirmPassword(val)
                      setIsConfirmValid(isValid)
                    }}
                    required
                    inputSize="md"
                    radius="lg"
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full" 
                  isLoading={isLoading} 
                  disabled={!isFormValid}
                  rightIcon={faArrowRight}
                  size="lg"
                >
                  Reset Password
                </Button>

                {/* Login Link */}
                <p className="text-center text-sm text-secondary">
                  Remember your password?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Back to Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}