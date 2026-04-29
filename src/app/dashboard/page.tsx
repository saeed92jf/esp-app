'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { Button } from '@/components/ui'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name}!
              </p>
            </div>
            <Button variant="outline" onClick={() => logout()}>
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">Projects</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">0</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-900">Clients</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">0</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-gray-900">Revenue</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">$0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}