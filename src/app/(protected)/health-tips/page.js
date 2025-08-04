'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  Heart, 
  Activity, 
  Apple, 
  Brain, 
  Shield, 
  AlertTriangle,
  Clock,
  User,
  Stethoscope,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowLeft
} from 'lucide-react'
import { useProtectedProfile } from '@/hooks/useProtectedProfile'
import Loader from '@/components/ui/Loader'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function HealthTips() {

  const [healthTips, setHealthTips] = useState(null)

  const [generating, setGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [expandedSections, setExpandedSections] = useState({})
  const router = useRouter()
    const {  profile, loading } = useProtectedProfile()

  const categories = [
    { id: 'general', name: 'General Health', icon: Heart },
    { id: 'diet', name: 'Diet & Nutrition', icon: Apple },
    { id: 'exercise', name: 'Exercise & Fitness', icon: Activity },
    { id: 'mental', name: 'Mental Health', icon: Brain },
    { id: 'preventive', name: 'Preventive Care', icon: Shield }
  ]


  if(loading){
    <Loader/>
  }


  const generateHealthTips = async (userId, category = 'general') => {
    setGenerating(true)
    try {
      const response = await fetch('/api/health-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, category }),
      })

      const result = await response.json()
      
      if (result.success) {
        setHealthTips(result.data)
      } else {
        console.error('Error generating health tips:', result.error)
      }
    } catch (error) {
      console.error('Error generating health tips:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    if (profile) {
      generateHealthTips(profile.id, category)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'diet': return Apple
      case 'exercise': return Activity
      case 'lifestyle': return Heart
      case 'medication': return Stethoscope
      case 'monitoring': return Activity
      default: return Info
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your health profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
<div className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">

      {/* Left section: Back + Title */}
      <div className="flex flex-col gap-4 sm:gap-2">
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium w-fit"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm sm:text-base">Back to Dashboard</span>
        </button>

        {/* Heading and Subtext */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Health Tips</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Personalized recommendations for your health
          </p>
        </div>
      </div>

      {/* Right section: Refresh button */}
      <button
        onClick={() => profile && generateHealthTips(profile.id, selectedCategory)}
        disabled={generating}
        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 w-full sm:w-auto"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`} />
        {generating ? "Generating..." : "Refresh Tips"}
      </button>
    </div>
  </div>
</div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center mb-4">
                <User className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Your Profile</h3>
                  <p className="text-sm text-gray-600">Health Overview</p>
                </div>
              </div>
              {profile && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{profile.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{profile.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{profile.location}</span>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-600 text-xs">Existing Conditions:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {profile.existing_conditions?.map((condition, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                        >
                          {condition}
                        </span>
                      )) || <span className="text-gray-400 text-xs">None</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {generating ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Health Tips</h3>
                <p className="text-gray-600">Please wait while we create personalized recommendations for you...</p>
              </div>
            ) : healthTips ? (
              <div className="space-y-6">
                {/* General Tips */}
                {healthTips.generalTips && healthTips.generalTips.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div
                      className="p-6 border-b border-gray-200 cursor-pointer"
                      onClick={() => toggleSection('general')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Heart className="h-6 w-6 text-blue-600 mr-3" />
                          <h2 className="text-xl font-semibold text-gray-900">General Health Tips</h2>
                        </div>
                        {expandedSections.general ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                    {(expandedSections.general !== false) && (
                      <div className="p-6">
                        <div className="grid gap-4">
                          {healthTips.generalTips.map((tip, index) => {
                            const IconComponent = getCategoryIcon(tip.category)
                            return (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center">
                                    <IconComponent className="h-5 w-5 text-gray-600 mr-2" />
                                    <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(tip.priority)}`}>
                                    {tip.priority}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{tip.description}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Condition-Specific Tips */}
                {healthTips.conditionSpecificTips && healthTips.conditionSpecificTips.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div
                      className="p-6 border-b border-gray-200 cursor-pointer"
                      onClick={() => toggleSection('conditions')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Stethoscope className="h-6 w-6 text-red-600 mr-3" />
                          <h2 className="text-xl font-semibold text-gray-900">Condition-Specific Tips</h2>
                        </div>
                        {expandedSections.conditions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                    {(expandedSections.conditions !== false) && (
                      <div className="p-6">
                        {healthTips.conditionSpecificTips.map((conditionTip, index) => (
                          <div key={index} className="mb-6 last:mb-0">
                            <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                              {conditionTip.condition}
                            </h3>
                            <div className="space-y-4">
                              {conditionTip.tips.map((tip, tipIndex) => (
                                <div key={tipIndex} className="border border-gray-200 rounded-lg p-4">
                                  <h4 className="font-medium text-gray-900 mb-2">{tip.title}</h4>
                                  <p className="text-gray-700 text-sm mb-3">{tip.description}</p>
                                  {tip.dosDonts && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <h5 className="font-medium text-green-700 mb-2">✓ Do</h5>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                          {tip.dosDonts.dos.map((item, i) => (
                                            <li key={i} className="flex items-start">
                                              <span className="text-green-500 mr-2">•</span>
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-red-700 mb-2">✗ Donts</h5>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                          {tip.dosDonts.donts.map((item, i) => (
                                            <li key={i} className="flex items-start">
                                              <span className="text-red-500 mr-2">•</span>
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Dietary Recommendations */}
                {healthTips.dietaryRecommendations && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div
                      className="p-6 border-b border-gray-200 cursor-pointer"
                      onClick={() => toggleSection('diet')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Apple className="h-6 w-6 text-green-600 mr-3" />
                          <h2 className="text-xl font-semibold text-gray-900">Dietary Recommendations</h2>
                        </div>
                        {expandedSections.diet ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                    {(expandedSections.diet !== false) && (
                      <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h3 className="font-semibold text-green-700 mb-3">Recommended Foods</h3>
                            <ul className="space-y-2">
                              {healthTips.dietaryRecommendations.recommended.map((food, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-700">
                                  <span className="text-green-500 mr-2">✓</span>
                                  {food}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-semibold text-red-700 mb-3">Foods to Avoid</h3>
                            <ul className="space-y-2">
                              {healthTips.dietaryRecommendations.avoid.map((food, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-700">
                                  <span className="text-red-500 mr-2">✗</span>
                                  {food}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {healthTips.dietaryRecommendations.mealPlan && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Suggested Meal Plan</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {Object.entries(healthTips.dietaryRecommendations.mealPlan).map(([meal, suggestion]) => (
                                <div key={meal} className="border border-gray-200 rounded-lg p-3">
                                  <h4 className="font-medium text-gray-900 capitalize mb-1">{meal}</h4>
                                  <p className="text-sm text-gray-700">{suggestion}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Exercise Guidelines */}
                {healthTips.exerciseGuidelines && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div
                      className="p-6 border-b border-gray-200 cursor-pointer"
                      onClick={() => toggleSection('exercise')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="h-6 w-6 text-blue-600 mr-3" />
                          <h2 className="text-xl font-semibold text-gray-900">Exercise Guidelines</h2>
                        </div>
                        {expandedSections.exercise ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                    {(expandedSections.exercise !== false) && (
                      <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <h3 className="font-semibold text-green-700 mb-3">Recommended Exercises</h3>
                            <ul className="space-y-2">
                              {healthTips.exerciseGuidelines.recommended.map((exercise, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-700">
                                  <span className="text-green-500 mr-2">✓</span>
                                  {exercise}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-semibold text-red-700 mb-3">Exercises to Avoid</h3>
                            <ul className="space-y-2">
                              {healthTips.exerciseGuidelines.avoid.map((exercise, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-700">
                                  <span className="text-red-500 mr-2">✗</span>
                                  {exercise}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-1">Duration</h4>
                            <p className="text-sm text-gray-700">{healthTips.exerciseGuidelines.duration}</p>
                          </div>
                          <div className="border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 mb-1">Frequency</h4>
                            <p className="text-sm text-gray-700">{healthTips.exerciseGuidelines.frequency}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Monitoring Advice */}
                {healthTips.monitoringAdvice && healthTips.monitoringAdvice.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div
                      className="p-6 border-b border-gray-200 cursor-pointer"
                      onClick={() => toggleSection('monitoring')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="h-6 w-6 text-purple-600 mr-3" />
                          <h2 className="text-xl font-semibold text-gray-900">Health Monitoring</h2>
                        </div>
                        {expandedSections.monitoring ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                    {(expandedSections.monitoring !== false) && (
                      <div className="p-6">
                        <div className="grid gap-4">
                          {healthTips.monitoringAdvice.map((advice, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">{advice.parameter}</h3>
                              <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Frequency:</span>
                                  <p className="text-gray-600">{advice.frequency}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Normal Range:</span>
                                  <p className="text-gray-600">{advice.normalRange}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">When to Alert:</span>
                                  <p className="text-gray-600">{advice.whenToAlert}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Lifestyle Modifications */}
                {healthTips.lifestyleModifications && healthTips.lifestyleModifications.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div
                      className="p-6 border-b border-gray-200 cursor-pointer"
                      onClick={() => toggleSection('lifestyle')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Brain className="h-6 w-6 text-indigo-600 mr-3" />
                          <h2 className="text-xl font-semibold text-gray-900">Lifestyle Modifications</h2>
                        </div>
                        {expandedSections.lifestyle ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                    {(expandedSections.lifestyle !== false) && (
                      <div className="p-6">
                        <div className="grid gap-4">
                          {healthTips.lifestyleModifications.map((mod, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 capitalize mb-2">{mod.category}</h3>
                              <p className="text-gray-700 text-sm mb-2">{mod.recommendation}</p>
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <span className="font-medium text-blue-800 text-sm">How to implement:</span>
                                <p className="text-blue-700 text-sm mt-1">{mod.implementation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Warning Signs */}
                {healthTips.warningSignsToWatch && healthTips.warningSignsToWatch.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div
                      className="p-6 border-b border-gray-200 cursor-pointer"
                      onClick={() => toggleSection('warnings')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                          <h2 className="text-xl font-semibold text-gray-900">Warning Signs to Watch</h2>
                        </div>
                        {expandedSections.warnings ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                    {(expandedSections.warnings !== false) && (
                      <div className="p-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                            <span className="font-semibold text-red-800">Important Warning Signs</span>
                          </div>
                          <ul className="space-y-2">
                            {healthTips.warningSignsToWatch.map((sign, index) => (
                              <li key={index} className="flex items-start text-sm text-red-700">
                                <span className="text-red-500 mr-2 mt-1">⚠</span>
                                {sign}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Emergency Guidelines */}
                {healthTips.emergencyGuidelines && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div
                      className="p-6 border-b border-gray-200 cursor-pointer"
                      onClick={() => toggleSection('emergency')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Shield className="h-6 w-6 text-red-600 mr-3" />
                          <h2 className="text-xl font-semibold text-gray-900">Emergency Guidelines</h2>
                        </div>
                        {expandedSections.emergency ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                    {(expandedSections.emergency !== false) && (
                      <div className="p-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-red-800 mb-2">When to Call Emergency Services:</h3>
                              <p className="text-red-700 text-sm">{healthTips.emergencyGuidelines.whenToCall}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold text-red-800 mb-2">Emergency Contact:</h3>
                              <p className="text-red-700 text-sm">{healthTips.emergencyGuidelines.emergencyContact}</p>
                              {profile?.emergency_contact_phone && (
                                <p className="text-red-700 text-sm font-medium mt-1">
                                  Your Emergency Contact: {profile.emergency_contact_phone}
                                </p>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-red-800 mb-2">Immediate Actions:</h3>
                              <ul className="space-y-1">
                                {healthTips.emergencyGuidelines.immediateActions.map((action, index) => (
                                  <li key={index} className="flex items-start text-sm text-red-700">
                                    <span className="text-red-500 mr-2">•</span>
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">Medical Disclaimer</h3>
                      <p className="text-blue-700 text-sm">{healthTips.disclaimer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Health Tips Generated</h3>
                <p className="text-gray-600 mb-4">Click Refresh Tip to generate personalized health recommendations.</p>
                <button
                  onClick={() => profile && generateHealthTips(profile.id, selectedCategory)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Health Tips
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}