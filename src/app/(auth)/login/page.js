'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Eye, EyeOff } from 'lucide-react'
import { signIn } from '../../../lib/auth'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { getCurrentUser, signOut } from '../../../lib/auth'
import { useProtectedUser } from '@/hooks/useProtectedUser'
import Loader from '@/components/ui/Loader'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [shouldShowLogin, setShouldShowLogin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUserAndProfile = async () => {
      try {
        setAuthLoading(true)
        const currentUser = await getCurrentUser()
      
        
        // No user: show login page
        if (!currentUser) {
          setShouldShowLogin(true)
          setAuthLoading(false)
          return
        }

        // User exists, check profile
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()



        if (!profileData) {
          // User exists but hasn't completed onboarding
          router.replace('/onboarding')
        } else {
          // User is fully authenticated and has profile
          router.replace('/dashboard')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        // On error, show login page
        setShouldShowLogin(true)
        setAuthLoading(false)
      }
    }

    checkUserAndProfile()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await signIn(email, password)
      
      if (authError) {
        setError(authError.message)
      } else {
        // After successful login, check profile again
        const currentUser = await getCurrentUser()
        if (currentUser) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()

          if (!profileData) {
            router.replace('/onboarding')
          } else {
            router.replace('/dashboard')
          }
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loader while checking authentication
  if (authLoading || !shouldShowLogin) {
    return <Loader />
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Heart className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Do not have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up here
            </Link>
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
            
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
        
        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-500">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}