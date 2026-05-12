'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

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
    const baseClass = "relative px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 cursor-pointer rounded-lg"
    
    if (isActive) {
      return `${baseClass} text-primary`
    } else {
      return `${baseClass} text-secondary hover:text-primary hover:bg-secondary`
    }
  }

  return (
    <div className={`relative ${className}`}>
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-secondary shadow-md border border-border-light transition-all hover:bg-tertiary"
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
          className="relative flex justify-center items-center gap-2 bg-secondary p-1.5 rounded-2xl shadow-sm border border-border-light min-w-max"
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={el => { if (el) tabsRef.current[index] = el }}
              onClick={() => onChange(item.id)}
              className={getTabButtonClass(activeTab === item.id)}
            >
              {item.icon && <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />}
              {item.label}
            </button>
          ))}
          
          <div
            className="tabs-underline"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
              bottom: '0px',
              height: '3px',
            }}
          />
        </div>
      </div>
      
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-secondary shadow-md border border-border-light transition-all hover:bg-tertiary"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 text-primary" />
        </button>
      )}
    </div>
  )
}