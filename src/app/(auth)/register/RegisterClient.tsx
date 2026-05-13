// modules/auth/components/RegisterClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { EmailInput } from '@/components/ui'
import { TextInput } from '@/components/ui'
import { RegisterPasswordInput, ConfirmPasswordInput } from '@/components/ui/Password'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'

export function RegisterClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [isConfirmValid, setIsConfirmValid] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isFormValid = name && email && isPasswordValid && isConfirmValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Registration successful but auto-login failed. Please login manually.')
        router.push('/login')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
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
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Start your journey with us</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                    <p className="text-sm text-error m-0">{error}</p>
                  </div>
                )}

                <TextInput
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <EmailInput
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(val) => setEmail(val)}
                  required
                />

                <RegisterPasswordInput
                  label="Password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(val, isValid) => {
                    setPassword(val)
                    setIsPasswordValid(isValid || false)
                  }}
                  required
                />

                <ConfirmPasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
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
                  Create Account
                </Button>

                <p className="text-center text-sm text-secondary">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
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