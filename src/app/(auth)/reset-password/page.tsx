import { Metadata } from 'next'
import { ResetPasswordClient } from './ResetPasswordClient'

export const metadata: Metadata = {
  title: 'Reset Password | ESP Webapp',
  description: 'Create a new password',
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}