// app/components/ProtectedWrapper.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser, signOut } from '../lib/auth'

export default async function ProtectedWrapper({ children }) {
  const user = await getCurrentUser()

  console.log(user,'user')

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
