// components/ui/SearchInput.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import { searchData, type SearchResult } from '@/data/search-data'

interface SearchInputProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onResultSelect?: (result: SearchResult) => void
  className?: string
  disabled?: boolean
  data?: SearchResult[]
}

// تابع هایلایت متن با متغیرهای تم
const highlightText = (text: string, query: string) => {
  if (!query || query.length < 2) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) => 
    regex.test(part) ? (
     <mark key={index} className="px-0.5 py-0" style={{ backgroundColor: 'rgba(255, 0, 0, 0.4)', color: 'var(--color-warning)' }}>
  {part}
</mark>
    ) : (
      <span key={index}>{part}</span>
    )
  )
}

export function SearchInput({ 
  placeholder = 'Search features, documents, or projects...', 
  onSearch, 
  onResultSelect, 
  className = '',
  disabled = false,
  data = searchData
}: SearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedIndexRef = useRef(-1)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const isSelectingRef = useRef(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
        selectedIndexRef.current = -1
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Adjust dropdown position
  useEffect(() => {
    if (isOpen && wrapperRef.current && dropdownRef.current) {
      const inputRect = wrapperRef.current.getBoundingClientRect()
      const dropdownHeight = dropdownRef.current.offsetHeight
      const spaceBelow = window.innerHeight - inputRect.bottom
      const spaceAbove = inputRect.top
      
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        dropdownRef.current.style.top = 'auto'
        dropdownRef.current.style.bottom = '100%'
        dropdownRef.current.style.marginTop = '0'
        dropdownRef.current.style.marginBottom = '8px'
      } else {
        dropdownRef.current.style.top = '100%'
        dropdownRef.current.style.bottom = 'auto'
        dropdownRef.current.style.marginTop = '8px'
        dropdownRef.current.style.marginBottom = '0'
      }
    }
  }, [isOpen, results])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  // Reset selected index when results change
  useEffect(() => {
    if (!isSelectingRef.current) {
      setSelectedIndex(-1)
      selectedIndexRef.current = -1
    }
  }, [results])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (query.length > 1 && !isSelectingRef.current) {
      setIsLoading(true)
      setIsOpen(true)
      
      timeoutRef.current = setTimeout(() => {
        const filtered = data.filter(
          (r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.description.toLowerCase().includes(query.toLowerCase())
        )
        setResults(filtered)
        setIsLoading(false)
        onSearch?.(query)
      }, 500)
    } else if (query.length <= 1 && !isSelectingRef.current) {
      setIsLoading(false)
      setIsOpen(false)
      setResults([])
      setSelectedIndex(-1)
      selectedIndexRef.current = -1
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [query, onSearch, data])

  const handleSelect = (result: SearchResult) => {
    // جلوگیری از اجرای مجدد
    isSelectingRef.current = true
    
    // بستن پاپ‌آپ بلافاصله
    setIsOpen(false)
    setResults([])
    setSelectedIndex(-1)
    selectedIndexRef.current = -1
    
    // تنظیم مقدار query
    setQuery(result.title)
    
    // پاک کردن تایمرهای در حال اجرا
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // صدا زدن callback
    onResultSelect?.(result)
    
    // ریست فلگ بعد از یک تاخیر کوتاه
    setTimeout(() => {
      isSelectingRef.current = false
    }, 200)
  }

  const clearSearch = () => {
    isSelectingRef.current = false
    setQuery('')
    setIsOpen(false)
    setResults([])
    setSelectedIndex(-1)
    selectedIndexRef.current = -1
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const handleFocus = () => {
    if (query.length > 1 && !isSelectingRef.current) {
      setIsOpen(true)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        e.stopPropagation()
        setSelectedIndex((prev) => {
          const newIndex = prev + 1
          const nextIndex = newIndex >= results.length ? 0 : newIndex
          selectedIndexRef.current = nextIndex
          return nextIndex
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        e.stopPropagation()
        setSelectedIndex((prev) => {
          const newIndex = prev - 1
          const nextIndex = newIndex < 0 ? results.length - 1 : newIndex
          selectedIndexRef.current = nextIndex
          return nextIndex
        })
        break
      case 'Enter':
        e.preventDefault()
        e.stopPropagation()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        setIsOpen(false)
        setSelectedIndex(-1)
        selectedIndexRef.current = -1
        break
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-primary/10 text-primary'
      case 'document': return 'bg-success/10 text-success'
      case 'project': return 'bg-info/10 text-info'
      case 'page': return 'bg-warning/10 text-warning'
      default: return 'bg-secondary/10 text-secondary'
    }
  }

  return (
    <div ref={wrapperRef} className={cn('relative w-full max-w-md mx-auto', className)}>
      {/* Search Input Container */}
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 z-10 pointer-events-none">
          <FontAwesomeIcon 
            icon={faSearch} 
            className="w-4 h-4 text-tertiary transition-colors" 
          />
        </div>
        
        {/* Input field with semantic variables */}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            if (!isSelectingRef.current) {
              setQuery(e.target.value)
            }
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full h-12 px-4 py-2 text-base rounded-full outline-none',
            'bg-primary',
            'text-primary placeholder:text-placeholder',
            'border border-light',
            'shadow-lg',
            'transition-all duration-200',
            'focus:border-focus focus:outline-none',
            disabled && 'opacity-50 cursor-not-allowed',
            'pl-10 pr-10'
          )}
        />
        
        {/* Loading spinner - فقط در حالت غیر انتخاب نمایش داده شود */}
        {isLoading && !isSelectingRef.current && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
            <FontAwesomeIcon 
              icon={faSpinner} 
              className="w-4 h-4 text-primary animate-spin" 
            />
          </div>
        )}
        
        {/* Clear button */}
        {!isLoading && query && !isSelectingRef.current && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 z-10 transition-colors text-tertiary hover:text-primary cursor-pointer"
            aria-label="Clear search"
          >
            <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown - فقط در حالت غیر انتخاب و باز بودن نمایش داده شود */}
      {isOpen && query.length > 1 && !isSelectingRef.current && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-2 rounded-2xl shadow-2xl border border-light overflow-hidden z-50 bg-primary  animate-fade-in-up"
        >
          {isLoading ? (
            // حالت لودینگ
            <div className="px-4 py-8 text-center">
              <FontAwesomeIcon 
                icon={faSpinner} 
                className="w-6 h-6 text-primary animate-spin mx-auto mb-3" 
              />
              <p className="text-sm text-tertiary">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {/* Results header */}
              <div className="px-4 py-3 border-b border-light flex items-center justify-between ">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <p className="text-xs font-medium text-success">
                    {results.length} result{results.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <p className="text-xs text-tertiary">
                  ↑ ↓ to navigate • Enter to select
                </p>
              </div>
              
              {/* Results list */}
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, idx) => (
                  <button
                    key={result.id}
                    data-index={idx}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => {
                      if (!isSelectingRef.current) {
                        setSelectedIndex(idx)
                        selectedIndexRef.current = idx
                      }
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 transition-all duration-200 border-b border-light last:border-0 group cursor-pointer',
                      selectedIndex === idx && 'bg-secondary'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon container */}
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                        getTypeStyles(result.type)
                      )}>
                        <span className="text-base">{result.icon || '🔍'}</span>
                      </div>
                      
                      {/* Result details with highlight */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-primary">
                            {highlightText(result.title, query)}
                          </span>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', getTypeStyles(result.type))}>
                            {result.type}
                          </span>
                        </div>
                        <p className="text-xs text-tertiary line-clamp-1">
                          {highlightText(result.description, query)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            // حالت بدون نتیجه
            <div className="px-4 py-8 text-center">
              <div className="text-5xl mb-3">😕</div>
              <p className="text-sm text-secondary font-medium">
                No results found
              </p>
              <p className="text-xs text-tertiary mt-1">
                We couldn't find anything for "<span className="font-medium text-primary">{query}</span>"
              </p>
              <p className="text-xs text-tertiary mt-2">
                Try different keywords or check your spelling
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}