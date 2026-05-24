// src/components/ui/Tabs.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  icon?: any
}

export interface TabsProps {
  items: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function Tabs({ items, activeTab, onChange, className = '' }: TabsProps) {
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // لاگ برای بررسی تکراری بودن کلیدها
  console.log('📋 Tabs rendered with items:', items.map(item => ({ id: item.id, label: item.label })))
  
  // بررسی وجود کلیدهای تکراری
  const uniqueIds = new Set()
  const duplicates = items.filter(item => {
    if (uniqueIds.has(item.id)) {
      return true
    }
    uniqueIds.add(item.id)
    return false
  })
  
  if (duplicates.length > 0) {
    console.error('❌ Duplicate tab IDs found:', duplicates.map(d => d.id))
  }

  const updateUnderlinePosition = useCallback(() => {
    const activeIndex = items.findIndex(item => item.id === activeTab)
    const activeTabElement = tabsRef.current[activeIndex]
    const containerElement = containerRef.current
    
    if (activeTabElement && containerElement) {
      const containerRect = containerElement.getBoundingClientRect()
      const tabRect = activeTabElement.getBoundingClientRect()
      
      setUnderlineStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      })
    }
  }, [activeTab, items])

  const checkScrollPosition = useCallback(() => {
    if (!wrapperRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = wrapperRef.current
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!wrapperRef.current) return
    const scrollAmount = direction === 'left' ? -200 : 200
    wrapperRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    setTimeout(updateUnderlinePosition, 300)
  }

  const scrollToActiveTab = useCallback(() => {
    const activeIndex = items.findIndex(item => item.id === activeTab)
    const activeTabElement = tabsRef.current[activeIndex]
    
    if (activeTabElement && wrapperRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect()
      const tabRect = activeTabElement.getBoundingClientRect()
      
      if (tabRect.left < wrapperRect.left || tabRect.right > wrapperRect.right) {
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
        setTimeout(updateUnderlinePosition, 300)
      }
    }
  }, [activeTab, items, updateUnderlinePosition])

  useEffect(() => {
    updateUnderlinePosition()
  }, [updateUnderlinePosition])

  useEffect(() => {
    scrollToActiveTab()
  }, [scrollToActiveTab])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (wrapper) {
      wrapper.addEventListener('scroll', checkScrollPosition)
      checkScrollPosition()
      
      const resizeObserver = new ResizeObserver(() => {
        checkScrollPosition()
        updateUnderlinePosition()
      })
      resizeObserver.observe(wrapper)
      
      return () => {
        wrapper.removeEventListener('scroll', checkScrollPosition)
        resizeObserver.disconnect()
      }
    }
  }, [checkScrollPosition, updateUnderlinePosition])

  useEffect(() => {
    window.addEventListener('resize', updateUnderlinePosition)
    return () => window.removeEventListener('resize', updateUnderlinePosition)
  }, [updateUnderlinePosition])

  const getTabButtonClass = (isActive: boolean) => {
    return cn(
      'relative px-4 sm:px-5 py-2 sm:py-2.5',
      'text-sm font-medium transition-all duration-200',
      'whitespace-nowrap flex items-center gap-2',
      'cursor-pointer rounded-lg',
      'bg-transparent border-none',
      isActive
        ? 'text-primary'
        : 'text-secondary hover:text-primary hover:bg-secondary'
    )
  }

  return (
    <div className={cn('relative w-full max-w-max mx-auto', className)}>
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-20',
            'w-10 h-10 rounded-full',
            'bg-secondary shadow-md border border-medium',
            'flex items-center justify-center',
            'transition-all duration-200 cursor-pointer',
            'hover:bg-tertiary'
          )}
          aria-label="Scroll left"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 text-primary" />
        </button>
      )}
      
      <div 
        ref={wrapperRef}
        className="overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div 
          ref={containerRef}
          className={cn(
            'relative flex justify-center items-center gap-2',
            'bg-tertiary px-8 py-1.5 rounded-2xl',
            'shadow-sm border border-medium',
            'w-max min-w-max'
          )}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={el => { if (el) tabsRef.current[index] = el }}
              onClick={() => onChange(item.id)}
              className={getTabButtonClass(activeTab === item.id)}
            >
              {item.icon && (
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
              )}
              {item.label}
            </button>
          ))}
          
          <div
            className="absolute bottom-0 h-0.5 rounded-full transition-all duration-300 z-10"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
              background: 'var(--border-gradient-primary)'
            }}
          />
        </div>
      </div>
      
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-20',
            'w-10 h-10 rounded-full',
            'bg-secondary shadow-md border border-medium',
            'flex items-center justify-center',
            'transition-all duration-200 cursor-pointer',
            'hover:bg-tertiary'
          )}
          aria-label="Scroll right"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 text-primary" />
        </button>
      )}
    </div>
  )
}