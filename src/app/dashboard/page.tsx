// src/app/dashboard/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="card p-6 text-center">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your personal dashboard
          </p>
        </div>

        {/* Personal Information */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">👤</span> Personal Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="font-medium">Full Name:</span>
              <span>{session.user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="font-medium">Email Address:</span>
              <span>{session.user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="font-medium">Role:</span>
              <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
                {session.user?.role === 'ADMIN' && '👑 Administrator'}
                {session.user?.role === 'ENGINEER' && '🔧 Engineer'}
                {session.user?.role === 'EMPLOYEE' && '💼 Employee'}
                {session.user?.role === 'CUSTOMER' && '👤 Customer'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="font-medium">Phone Number:</span>
              <span>+98 912 345 6789</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Date of Birth:</span>
              <span>1990-01-15</span>
            </div>
          </div>
        </div>

        {/* Educational Information */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🎓</span> Educational Information
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Master of Science in Computer Engineering</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sharif University of Technology</p>
              <p className="text-xs text-gray-500">2020 - 2023 | GPA: 3.8/4.0</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Bachelor of Science in Software Engineering</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amirkabir University of Technology</p>
              <p className="text-xs text-gray-500">2015 - 2019 | GPA: 3.6/4.0</p>
            </div>
          </div>
        </div>

        {/* Professional Skills */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">💻</span> Professional Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'TailwindCSS', 'GraphQL', 'Docker'].map((skill) => (
              <span key={skill} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">💼</span> Work Experience
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-1">Senior Frontend Developer</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tech Company Inc.</p>
              <p className="text-xs text-gray-500">2023 - Present | Full-time</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-1">Full Stack Developer</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Startup Studio</p>
              <p className="text-xs text-gray-500">2020 - 2023 | Full-time</p>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <div className="text-center pt-4">
          <Link href="/">
            <Button variant="primary" size="lg" radius="xl">
              Get Started → 
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}