'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export function useProtectedProfile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserAndProfile = async () => {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (!profileData) {
        router.push('/onboarding')
        return
      }

      setProfile(profileData)
      setLoading(false)
    }

    checkUserAndProfile()
  }, [router])

  return { user, profile, loading, setProfile }
}
