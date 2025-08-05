// app/components/ProtectedWrapper.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser, signOut } from '../lib/auth'

export default async function ProtectedWrapper({ children }) {
  const user = await getCurrentUser()



  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
