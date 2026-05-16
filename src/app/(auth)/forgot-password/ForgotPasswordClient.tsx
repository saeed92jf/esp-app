// modules/auth/components/ForgotPasswordClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faArrowRight, faCheckCircle, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/Button'
import { EmailInput } from '@/components/ui'

// ============================================
// FORGOT PASSWORD CLIENT COMPONENT
// Email submission form for password reset
// Sends reset link to user's email
// Uses Tailwind CSS - no separate CSS file needed
// ============================================

export function ForgotPasswordClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Success Card */}
            <div className="bg-primary rounded-2xl shadow-xl border border-light overflow-hidden text-center">
              <div className="p-8">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">Check your email</h2>
                <p className="text-secondary mb-6">
                  We've sent a password reset link to{' '}
                  <strong className="text-primary">{email}</strong>
                </p>
                <Button variant="primary" asChild size="lg">
                  <Link href="/login">Back to Login</Link>
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

          {/* Forgot Password Form Card */}
          <div className="bg-primary rounded-2xl shadow-xl border border-light overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center border-b border-light">
              <h1 className="text-2xl font-bold text-primary mb-1">Forgot password?</h1>
              <p className="text-sm text-secondary">
                Enter your email address and we'll send you a link to reset your password.
              </p>
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

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Email Address
                  </label>
                  <EmailInput
                    placeholder="you@example.com"
                    value={email}
                    onChange={(val) => setEmail(val)}
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
                  rightIcon={faPaperPlane}
                  size="lg"
                >
                  Send Reset Link
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