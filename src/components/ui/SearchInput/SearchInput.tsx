'use client'

import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Input } from '@/components/ui'

export interface SearchResult {
  id: string
  title: string
  description: string
  type: 'feature' | 'document' | 'project' | 'page'
  url: string
  icon?: string
}

interface SearchInputProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onResultSelect?: (result: SearchResult) => void
  className?: string
}

const mockResults: SearchResult[] = [
  { id: '1', title: 'CRM', description: 'Manage client relationships', type: 'feature', url: '/features/crm', icon: '👥' },
  { id: '2', title: 'Pipeline', description: 'Track leads and deals', type: 'feature', url: '/features/pipeline', icon: '📊' },
  { id: '3', title: 'Time Tracking', description: 'Track billable hours', type: 'feature', url: '/features/time-tracking', icon: '⏱️' },
  { id: '4', title: 'Client Portal', description: 'Secure client access', type: 'feature', url: '/features/client-portal', icon: '🔒' },
  { id: '5', title: 'Estimates', description: 'Professional estimates', type: 'document', url: '/docs/estimates', icon: '💰' },
  { id: '6', title: 'Getting Started Guide', description: 'Learn the basics', type: 'document', url: '/docs/getting-started', icon: '📚' },
]

export function SearchInput({ 
  placeholder = 'Search features, documents, or projects...', 
  onSearch, 
  onResultSelect, 
  className = '' 
}: SearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (query.length > 1) {
      setIsLoading(true)
      setIsOpen(true)
      
      timeoutRef.current = setTimeout(() => {
        const filtered = mockResults.filter(
          (r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.description.toLowerCase().includes(query.toLowerCase())
        )
        setResults(filtered)
        setIsLoading(false)
        onSearch?.(query)
      }, 500)
    } else {
      setIsLoading(false)
      if (query.length === 0) {
        setResults([])
        setIsOpen(false)
      } else {
        setIsOpen(false)
        setResults([])
      }
    }
  }, [query, onSearch])

  const handleSelect = (result: SearchResult) => {
    setQuery(result.title)
    setIsOpen(false)
    onResultSelect?.(result)
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
    setResults([])
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-primary/10 text-primary'
      case 'document': return 'bg-success/10 text-success'
      case 'project': return 'bg-purple-500/10 text-purple-500'
      case 'page': return 'bg-warning/10 text-warning'
      default: return 'bg-tertiary text-secondary'
    }
  }

  return (
    <div ref={wrapperRef} className={`relative w-full max-w-md mx-auto ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 z-10 pointer-events-none">
          <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-tertiary group-focus-within:text-primary transition-colors" />
        </div>
        
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(query.length > 1)}
          placeholder={placeholder}
          inputSize="md"       
          className="pl-10 pr-10"
          radius="full"
          borderColor="secondary"
          shadow="lg"
        />
        
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {!isLoading && query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 z-10 transition-colors text-tertiary hover:text-primary"
            aria-label="Clear search"
          >
            <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && query.length > 1 && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 right-0 bg-primary rounded-2xl shadow-2xl border border-light overflow-hidden animate-dropdown"
          style={{ 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 9999,
            transformOrigin: 'top center'
          }}
        >
          {results.length > 0 ? (
            <div>
              <div className="px-4 py-3 border-b border-light flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <p className="text-xs font-medium text-success">
                    {results.length} result{results.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-success">✓</span>
                  <span className="text-xs text-secondary">Ready</span>
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, idx) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary transition-all duration-200 border-b border-light last:border-0 group animate-result-item"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110 ${getTypeColor(result.type)}`}>
                        <span className="text-base">{result.icon || '🔍'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-primary group-hover:text-primary transition-colors">
                            {result.title}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                        </div>
                        <p className="text-xs text-secondary line-clamp-1">{result.description}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="relative h-0.5 bg-linear-to-r from-transparent via-success to-transparent" />
            </div>
          ) : (
            !isLoading && (
              <div className="p-8 text-center bg-primary animate-fade-in-up">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-sm text-secondary">
                  No results found for "<span className="font-medium text-primary">{query}</span>"
                </p>
                <p className="text-xs text-tertiary mt-2">
                  Try searching with different keywords
                </p>
              </div>
            )
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes dropdownFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes resultItemFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounceSoft {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-dropdown {
          animation: dropdownFadeIn 0.25s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        }
        
        .animate-result-item {
          opacity: 0;
          animation: resultItemFadeIn 0.2s ease-out forwards;
        }
        
        .animate-bounce-soft {
          animation: bounceSoft 0.6s ease-in-out infinite;
        }
        
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