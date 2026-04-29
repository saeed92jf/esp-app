'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/Input/Input'
import type { SearchInputProps, SearchResult } from '../types/search.types'

const mockResults: SearchResult[] = [
  { id: '1', title: 'CRM', description: 'Manage client relationships', type: 'feature', url: '/features/crm' },
  { id: '2', title: 'Pipeline', description: 'Track leads and deals', type: 'feature', url: '/features/pipeline' },
  { id: '3', title: 'Time Tracking', description: 'Track billable hours', type: 'feature', url: '/features/time-tracking' },
  { id: '4', title: 'Client Portal', description: 'Secure client access', type: 'feature', url: '/features/client-portal' },
  { id: '5', title: 'Estimates', description: 'Professional estimates', type: 'document', url: '/docs/estimates' },
]

export function SearchInput({ placeholder = 'Search features, documents, or projects...', onSearch, onResultSelect, className }: SearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

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
    if (query.length > 1) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        const filtered = mockResults.filter(
          (r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.description.toLowerCase().includes(query.toLowerCase())
        )
        setResults(filtered)
        setIsOpen(true)
        setIsLoading(false)
        onSearch?.(query)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query, onSearch])

  const handleSelect = (result: SearchResult) => {
    setQuery(result.title)
    setIsOpen(false)
    onResultSelect?.(result)
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`pl-10 pr-10 py-3 ${className}`}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {result.type === 'feature' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Feature
                    </span>
                  )}
                  {result.type === 'document' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Document
                    </span>
                  )}
                  {result.type === 'project' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Project
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{result.title}</p>
                  <p className="text-sm text-gray-500">{result.description}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}