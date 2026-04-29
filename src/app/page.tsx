import { Metadata } from 'next'
import { HomeClient } from './HomeClient'

export const metadata: Metadata = {
  title: 'ESP Webapp | Unified Platform for Engineering & Service Businesses',
  description: 'Consolidate your projects, clients, and billing into one integrated platform.',
}

export default function HomePage() {
   console.log('HomePage rendered') 
  return <HomeClient />
}