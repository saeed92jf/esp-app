// modules/auth/components/LoginClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { EmailInput } from '@/components/ui'
import { LoginPasswordInput } from '@/components/ui/Password'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'

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
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
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

                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                  Sign In
                </Button>

                <p className="text-center text-sm text-secondary">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>

                {/* Test Accounts */}
                <div className="mt-4 p-3 bg-tertiary rounded-lg border border-light text-center">
                  <p className="text-xs text-secondary font-medium mb-2">
                    🔐 Test Accounts (password: 123456)
                  </p>
                  <div className="text-xs text-left space-y-1 text-secondary">
                    <p>👑 Admin: admin@company.com</p>
                    <p>🔧 Engineer: engineer@company.com</p>
                    <p>💼 Employee: employee@company.com</p>
                    <p>👤 Customer: customer@company.com</p>
                    <p>🧪 Test: test@example.com</p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}