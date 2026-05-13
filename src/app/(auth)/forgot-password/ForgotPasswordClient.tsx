'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, EmailInput } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'

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
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-2">Check your email</h2>
                  <p className="text-secondary mb-6">
                    We've sent a password reset link to <strong className="text-primary">{email}</strong>
                  </p>
                  <Button variant="primary" asChild>
                    <Link href="/login">Back to Login</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              {/* Logo */}
              <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 group">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-inverse font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ESP<span className="text-primary">Webapp</span>
                </span>
              </Link>
              <CardTitle className="text-2xl">Forgot password?</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                    <p className="text-sm text-error m-0">{error}</p>
                  </div>
                )}

                <EmailInput
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(val) => setEmail(val)}
                  required
                />

                <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                  Send Reset Link
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