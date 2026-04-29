export interface SearchResult {
  id: string
  title: string
  description: string
  type: 'feature' | 'document' | 'project'
  url: string
}

export interface SearchInputProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onResultSelect?: (result: SearchResult) => void
  className?: string
}