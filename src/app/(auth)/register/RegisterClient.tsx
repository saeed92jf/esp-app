// modules/auth/components/RegisterClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock, faArrowRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/Button'
import { EmailInput } from '@/components/ui'
import { TextInput } from '@/components/ui'
import { RegisterPasswordInput, ConfirmPasswordInput } from '@/components/ui/Password'

// ============================================
// REGISTER CLIENT COMPONENT
// Registration form with name, email, and password validation
// Auto-login after successful registration
// Uses Tailwind CSS - no separate CSS file needed
// ============================================

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

          {/* Registration Form Card */}
          <div className="bg-primary rounded-2xl shadow-xl border border-light overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center border-b border-light">
              <h1 className="text-2xl font-bold text-primary mb-1">Create an account</h1>
              <p className="text-sm text-secondary">Start your journey with us</p>
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

                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Full Name
                  </label>
                  <TextInput
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    inputSize="md"
                    radius="lg"
                    className="w-full"
                  />
                </div>

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
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Password
                  </label>
                 <RegisterPasswordInput
  label="New Password"
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

<ConfirmPasswordInput
  label="Confirm New Password"
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
                  Create Account
                </Button>

                {/* Login Link */}
                <p className="text-center text-sm text-secondary">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
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