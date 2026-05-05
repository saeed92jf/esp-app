import { Metadata } from 'next'
import { LoginClient } from './LoginClient'

export const metadata: Metadata = {
  title: 'Login | ESP Webapp',
  description: 'Login to your ESP Webapp account',
}

export default function LoginPage() {
  return <LoginClient />
  
}

