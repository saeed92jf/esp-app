// app/metadata.ts
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ESP Webapp | Unified Platform for Engineering & Service Businesses',
  description: 'Consolidate your projects, clients, and billing into one integrated, easy-to-use platform.',
  keywords: 'CRM, Project Management, Service Business, ESP Webapp',
  authors: [{ name: 'ESP Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'ESP Webapp',
    description: 'Unified platform for engineering and service businesses',
    type: 'website',
  },
}