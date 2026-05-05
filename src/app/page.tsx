import { Metadata } from 'next'
import { HomeClient } from './HomeClient'

export const metadata: Metadata = {
  title: 'ESP Webapp | Unified Platform for Engineering & Service Businesses',
  description: 'Consolidate your projects, clients, and billing into one integrated, easy-to-use platform.',
  keywords: 'CRM, Project Management, Service Business, ESP Webapp',
}

export default function HomePage() {
  return <HomeClient />
}