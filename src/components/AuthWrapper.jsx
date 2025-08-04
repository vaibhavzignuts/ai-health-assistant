// app/components/AuthWrapper.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser, signOut } from '../lib/auth'

export default async function AuthWrapper({ children }) {
  const user = await getCurrentUser()

  if (user) {
    redirect('/dashboard') // or wherever your main page is
  }

  return <>{children}</>
}
