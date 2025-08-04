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
  User,
  Activity,
  Shield,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { getCurrentUser, signOut } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'
import Button from '../../../components/ui/Button'
import { useProtectedProfile } from '@/hooks/useProtectedProfile'
import Loader from '@/components/ui/Loader'

export default function DashboardPage() {

  const router = useRouter()
   const { user, profile, loading  } = useProtectedProfile()




  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
    <Loader/>
    )
  }

  const quickActions = [
    {
      title: 'AI Symptom Checker',
      description: 'Get instant AI-powered health insights from your symptoms',
      icon: Stethoscope,
      href: '/symptom-checker',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Find Healthcare Facilities',
      description: 'Discover nearby hospitals, clinics, and specialists',
      icon: MapPin,
      href: '/find-facility',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100'
    },
    {
      title: 'Medicine Reminders',
      description: 'Never miss a dose with smart medication tracking',
      icon: Pill,
      href: '/reminders',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Health Tips & Insights',
      description: 'Personalized wellness recommendations just for you',
      icon: Users,
      href: '/health-tips',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Heart className="h-10 w-10 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">HealthCare+</h1>
                <p className="text-base text-gray-600 font-medium">
                  Welcome back, {user?.user_metadata?.full_name || 'User'} 👋
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-2 px-4 py-2.5 font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Button>
              
              <Button
                variant="outline"
                size="md"
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2.5 font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Enhanced Welcome Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Your Personal Health Hub</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Your Health Dashboard
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Access all your health tools, track your wellness journey, and get personalized insights in one beautiful place
          </p>
        </div>

        {/* Enhanced Profile Summary Card */}
    {profile && (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8 mb-12 hover:shadow-2xl transition-all duration-300">
    <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-6 md:space-y-0">
      {/* Left Side */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg self-start sm:self-auto">
          <User className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Profile Overview</h3>
          <div className="text-base text-gray-700 space-y-2 font-medium">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Age:</span>
              <span>{profile.age}</span>
              <span className="hidden sm:inline mx-2">•</span>
              <span className="font-semibold">Gender:</span>
              <span>{profile.gender}</span>
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Language:</span>
              <span>{profile.preferred_language}</span>
            </p>
            {profile.existing_conditions?.length > 0 && (
              <p className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-semibold">Conditions:</span>
                <span className="flex-1">{profile.existing_conditions.join(', ')}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="md"
          onClick={() => router.push('/profile')}
          className="px-6 py-3 font-semibold border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
        >
          Edit Profile
        </Button>
      </div>
    </div>
  </div>
)}


        {/* Enhanced Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <div
                key={index}
                onClick={() => router.push(action.href)}
                className={`bg-gradient-to-br ${action.bgGradient} rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`bg-gradient-to-br ${action.gradient} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{action.title}</h3>
                <p className="text-base text-gray-700 leading-relaxed">{action.description}</p>
              </div>
            )
          })}
        </div>

        {/* Enhanced Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Health Tips Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Daily Health Tips</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="bg-green-500 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-base text-gray-800 font-medium">Drink at least 8 glasses of water daily for optimal hydration</p>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-base text-gray-800 font-medium">Take a 30-minute walk daily to boost cardiovascular health</p>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-base text-gray-800 font-medium">Get 7-9 hours of quality sleep for better immunity</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="md" 
              className="w-full mt-6 py-3 font-semibold text-base hover:bg-green-50 hover:border-green-300 transition-all duration-200"
              onClick={() => router.push('/health-tips')}
            >
              Discover More Tips
            </Button>
          </div>

          {/* Enhanced Emergency Information Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Emergency Info</h3>
            </div>
            {profile && (
              <div className="space-y-6">
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-base font-bold text-gray-900 mb-2">Emergency Contact</p>
                  <p className="text-lg font-semibold text-gray-800">{profile.emergency_contact_name}</p>
                  <p className="text-lg font-bold text-red-600">{profile.emergency_contact_phone}</p>
                </div>
                {profile.location && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-base font-bold text-gray-900 mb-2">Current Location</p>
                    <p className="text-lg text-gray-800 font-medium">{profile.location}</p>
                  </div>
                )}
              </div>
            )}
  
          </div>
        </div>
      </div>
    </div>
  )
}