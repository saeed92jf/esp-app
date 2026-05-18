// data/search-data.ts
export interface SearchResult {
  id: string
  title: string
  description: string
  type: 'feature' | 'document' | 'project' | 'page'
  url: string
  icon?: string
}

export const searchData: SearchResult[] = [
  { id: '1', title: 'CRM', description: 'Manage client relationships', type: 'feature', url: '/features/crm', icon: '👥' },
  { id: '2', title: 'Pipeline', description: 'Track leads and deals', type: 'feature', url: '/features/pipeline', icon: '📊' },
  { id: '3', title: 'Time Tracking', description: 'Track billable hours', type: 'feature', url: '/features/time-tracking', icon: '⏱️' },
  { id: '4', title: 'Client Portal', description: 'Secure client access', type: 'feature', url: '/features/client-portal', icon: '🔒' },
  { id: '5', title: 'Estimates', description: 'Professional estimates', type: 'document', url: '/docs/estimates', icon: '💰' },
  { id: '6', title: 'Getting Started Guide', description: 'Learn the basics', type: 'document', url: '/docs/getting-started', icon: '📚' },
  { id: '7', title: 'Dashboard', description: 'View your business analytics', type: 'feature', url: '/features/dashboard', icon: '📊' },
  { id: '8', title: 'API Documentation', description: 'REST API guide for developers', type: 'document', url: '/docs/api', icon: '🔌' },
  { id: '9', title: 'Mobile App', description: 'iOS and Android applications', type: 'project', url: '/projects/mobile-app', icon: '📱' },
  { id: '10', title: 'Marketing Site', description: 'Company landing page', type: 'page', url: '/marketing', icon: '🎯' },
]