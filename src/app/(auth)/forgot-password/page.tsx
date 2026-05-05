import { Metadata } from 'next'
import { ForgotPasswordClient } from './ForgotPasswordClient'

export const metadata: Metadata = {
  title: 'Forgot Password | ESP Webapp',
  description: 'Reset your password',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}