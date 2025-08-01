'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Heart, 
  Stethoscope, 
  Pill, 
  MapPin, 
  Users, 
  Phone, 
  Settings,
  LogOut,
  User
} from 'lucide-react'
import { getCurrentUser, signOut } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUserAndProfile = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      
      setUser(currentUser)
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
      
      if (!profileData) {
        // User hasn't completed onboarding
        router.push('/onboarding')
        return
      }
      
      setProfile(profileData)
      setLoading(false)
    }
    
    checkUserAndProfile()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: 'AI Symptom Checker',
      description: 'Describe symptoms and get AI insights',
      icon: Stethoscope,
      href: '/symptom-checker',
      color: 'bg-blue-500'
    },
    {
      title: 'Find Healthcare Facilities',
      description: 'Locate nearby hospitals and clinics',
      icon: MapPin,
      href: '/find-facility',
      color: 'bg-green-500'
    },
    {
      title: 'Medicine Reminders',
      description: 'Manage your medication schedule',
      icon: Pill,
      href: '/reminders',
      color: 'bg-purple-500'
    },
    {
      title: 'Health Tips',
      description: 'Personalized health recommendations',
      icon: Users,
      href: '/health-tips',
      color: 'bg-orange-500'
    },
    {
      title: 'Emergency Contacts',
      description: 'Quick access to emergency help',
      icon: Phone,
      href: '/emergency',
      color: 'bg-red-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">HealthCare+</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.user_metadata?.full_name || 'User'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Health Dashboard
          </h2>
          <p className="text-gray-600">
            Access all your health tools and information in one place
          </p>
        </div>

        {/* Profile Summary Card */}
        {profile && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Summary</h3>
                  <div className="text-sm text-gray-600 space-y-1 mt-2">
                    <p>Age: {profile.age} • Gender: {profile.gender}</p>
                    <p>Language: {profile.preferred_language}</p>
                    {profile.existing_conditions?.length > 0 && (
                      <p>Conditions: {profile.existing_conditions.join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/profile')}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <div
                key={index}
                onClick={() => router.push(action.href)}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className={`${action.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            )
          })}
        </div>

        {/* Recent Activity / Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Health Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-1 rounded">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-700">Drink at least 8 glasses of water daily</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-1 rounded">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-700">Take a 30-minute walk to boost your health</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-orange-100 p-1 rounded">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-700">Get 7-9 hours of sleep for better immunity</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => router.push('/health-tips')}
            >
              View All Tips
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Information</h3>
            {profile && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Emergency Contact</p>
                  <p className="text-sm text-gray-600">{profile.emergency_contact_name}</p>
                  <p className="text-sm text-blue-600">{profile.emergency_contact_phone}</p>
                </div>
                {profile.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-sm text-gray-600">{profile.location}</p>
                  </div>
                )}
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => router.push('/emergency')}
            >
              Emergency Options
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}