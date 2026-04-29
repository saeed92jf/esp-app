import { Metadata } from 'next'
import { RegisterClient } from './RegisterClient'

export const metadata: Metadata = {
  title: 'Register | ESP Webapp',
  description: 'Create your ESP Webapp account',
}

export default function RegisterPage() {
  return <RegisterClient />
}