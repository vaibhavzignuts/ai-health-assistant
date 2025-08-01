// app/(auth)/layout.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function AuthLayout({ children }) {
  const user = await getCurrentUser()

  if (user) redirect('/dashboard')

  return <>{children}</>
}
