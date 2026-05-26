// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui'

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // بررسی وجود کاربر در localStorage (سیستم Auth ساده شما)
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      router.push('/login')
      return
    }
    try {
      setUser(JSON.parse(savedUser))
    } catch {
      router.push('/login')
    }
  }, [router])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="mb-4">Welcome back, <strong>{user.name}</strong>!</p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Email: {user.email}</p>
        <Link href="/">
          <Button variant="primary">Go to Home</Button>
        </Link>
      </div>
    </div>
  )
}