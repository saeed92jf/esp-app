'use client'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        © {currentYear} ESP Webapp. All rights reserved.
      </div>
    </footer>
  )
}