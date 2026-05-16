// modules/auth/components/LoginClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/Button'
import { EmailInput } from '@/components/ui'
import { LoginPasswordInput } from '@/components/ui/Password'

// ============================================
// LOGIN CLIENT COMPONENT
// Login form with email and password validation
// Redirects to home page on successful login
// Uses Tailwind CSS - no separate CSS file needed
// ============================================

export function LoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError('Something went wrong')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

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

          {/* Login Form Card */}
          <div className="bg-primary rounded-2xl shadow-xl border border-light overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center border-b border-light">
              <h1 className="text-2xl font-bold text-primary mb-1">Welcome back</h1>
              <p className="text-sm text-secondary">Sign in to your account</p>
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

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-medium text-secondary">
                      Password
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-primary hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <LoginPasswordInput
                    placeholder="••••••"
                    value={password}
                    onChange={(val) => setPassword(val)}
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
                  rightIcon={faArrowRight}
                  size="lg"
                >
                  Sign In
                </Button>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-secondary">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>

                {/* Test Accounts */}
                <div className="mt-6 p-3 bg-tertiary rounded-lg border border-light">
                  <p className="text-xs text-secondary font-medium mb-2 text-center">
                    🔐 Test Accounts (password: 123456)
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-secondary">
                    <div className="flex items-center gap-1">
                      <span>👑</span> admin@company.com
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🔧</span> engineer@company.com
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💼</span> employee@company.com
                    </div>
                    <div className="flex items-center gap-1">
                      <span>👤</span> customer@company.com
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <span>🧪</span> test@example.com
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}