'use client'

import Link from 'next/link'
import { LoginForm } from '@/modules/auth/components/LoginForm'

export function LoginClient() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">
              ESP<span className="text-blue-600">Webapp</span>
            </span>
          </Link>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}