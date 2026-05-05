'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, EmailInput } from '@/components/ui'
import { RegisterPasswordInput, ConfirmPasswordInput } from '@/components/ui/Password'
import { authApi } from '@/modules/auth/services/authApi'

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
      const response = await authApi.register({ name, email, password })
      if (response.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        router.push('/dashboard')
      } else {
        setError(response.message || 'Registration failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
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
              <h1 className="mb-2">Create an account</h1>
              <p className="text-gray-600 dark:text-gray-400">Start your journey with us</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="form-error-box p-3 bg-danger/10 border border-danger/20 rounded-lg">
                  <p className="form-error m-0">{error}</p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="form-input"
                  required
                />
              </div>

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
                fullWidth 
                isLoading={isLoading} 
                disabled={!isFormValid}
              >
                Create Account
              </Button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}