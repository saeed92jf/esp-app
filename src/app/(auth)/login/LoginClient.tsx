// modules/auth/components/LoginClient.tsx (کد اصلاح شده)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'  // تغییر اینجا
import Link from 'next/link'
import { Button, EmailInput } from '@/components/ui'
import { LoginPasswordInput } from '@/components/ui/Password'

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
      // استفاده از signIn NextAuth
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,  // جلوگیری از ریدایرکت خودکار
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
              <h1 className="mb-2">Welcome back</h1>
              <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="form-error-box p-3 bg-danger/10 border border-danger/20 rounded-lg">
                  <p className="form-error m-0">{error}</p>
                </div>
              )}

              <EmailInput
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(val) => setEmail(val)}
                required
              />

              <LoginPasswordInput
                label="Password"
                placeholder="••••••"
                value={password}
                onChange={(val) => setPassword(val)}
                required
              />

              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                Sign In
              </Button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>

              {/* اکانت‌های تست (فقط برای توسعه) */}
              <div className="demo-box mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
                  🔐 Test Accounts (password: 123456)
                </p>
                <div className="text-xs text-left space-y-1">
                  <p>👑 Admin: admin@company.com</p>
                  <p>🔧 Engineer: engineer@company.com</p>
                  <p>💼 Employee: employee@company.com</p>
                  <p>👤 Customer: customer@company.com</p>
                  <p>🧪 Test: test@example.com</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}