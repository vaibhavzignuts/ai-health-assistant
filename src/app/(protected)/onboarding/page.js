'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, User, Phone, MapPin, AlertCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getCurrentUser } from '../../../lib/auth'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { useProtectedUser } from '@/hooks/useProtectedUser'
import Loader from '@/components/ui/Loader'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    existingConditions: [],
    preferredLanguage: 'English',
    emergencyContactName: '',
    emergencyContactPhone: '',
    location: ''
  })
  const router = useRouter()
      const { user, loading:autLoading } = useProtectedUser()



  const conditions = [
    'Diabetes', 'High Blood Pressure', 'Asthma', 'Heart Disease', 
    'Arthritis', 'Kidney Disease', 'Thyroid Issues', 'Mental Health'
  ]

  const languages = ['English', 'Hindi', 'Spanish', 'French', 'Other']



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleConditionToggle = (condition) => {
    const updated = formData.existingConditions.includes(condition)
      ? formData.existingConditions.filter(c => c !== condition)
      : [...formData.existingConditions, condition]
    
    setFormData({
      ...formData,
      existingConditions: updated
    })
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: user.id,
            age: parseInt(formData.age),
            gender: formData.gender,
            existing_conditions: formData.existingConditions,
            preferred_language: formData.preferredLanguage,
            emergency_contact_name: formData.emergencyContactName,
            emergency_contact_phone: formData.emergencyContactPhone,
            location: formData.location,
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }



  if (!user || autLoading) {
    return <Loader/>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lets set up your health profile
          </h1>
          <p className="text-gray-600">
            This helps us provide personalized health recommendations
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {step} of 3</span>
            <span className="text-sm text-gray-600">{Math.round((step / 3) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language
                </label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Health Conditions */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <AlertCircle className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Health Conditions</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                Select any existing health conditions (optional - helps us provide better recommendations)
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {conditions.map(condition => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => handleConditionToggle(condition)}
                    className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                      formData.existingConditions.includes(condition)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                This information is kept private and used only to personalize your health tips
              </p>
            </div>
          )}

          {/* Step 3: Emergency Contact */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Phone className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Emergency Contact & Location</h2>
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Emergency Contact Name"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  required
                  placeholder="Enter contact person's name"
                />
                
                <Input
                  label="Emergency Contact Phone"
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
                
                <Input
                  label="Your Location (City/Area)"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai, Maharashtra"
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Why we need this:</strong> Emergency contact for urgent situations, 
                  and location to help find nearby healthcare facilities.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className={step === 1 ? 'invisible' : ''}
            >
              Back
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && (!formData.age || !formData.gender)) ||
                  (step === 2 && false) // Step 2 is optional
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.emergencyContactName || !formData.emergencyContactPhone}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}