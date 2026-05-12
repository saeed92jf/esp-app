// src/app/test/page.tsx
'use client'

import { useTheme } from '@/theme/ThemeProvider'

export default function TestPage() {
  const { theme, toggleTheme, resolvedTheme } = useTheme()
  
  return (
    <div className="p-8">
      <h1>تست رنگ‌ها</h1>
      
      <div className="space-y-4 mt-4">
        <div className="bg-primary p-4 rounded">
          <p className="text-white">bg-primary - text-white</p>
        </div>
        
        <p className="text-primary">text-primary (باید به رنگ پرایمری باشد)</p>
        <p className="text-primary-dark">text-primary-dark (باید سفید/مشکی باشد)</p>
        <p className="text-secondary">text-secondary (باید خاکستری باشد)</p>
        
        <div className="mt-4 p-4 bg-secondary rounded">
          <p>bg-secondary</p>
        </div>

    <span className="text-primary font-semibold text-sm uppercase tracking-wider">
  Features
</span>

<span 
  className="font-semibold text-sm uppercase tracking-wider"
  style={{ color: 'var(--color-primary)' }}
>
  Features
</span>
        
        <button 
          onClick={toggleTheme}
          className="px-4 py-2 bg-primary text-white rounded mt-4"
        >
          Current Theme: {resolvedTheme} - کلیک برای تغییر
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        dark class on html: {document.documentElement.classList.contains('dark') ? '✅ دارد' : '❌ ندارد'}
      </div>
    </div>
  )
}