'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, User, Phone, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getCurrentUser } from '../../../lib/auth'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { useProtectedUser } from '@/hooks/useProtectedUser'
import Loader from '@/components/ui/Loader'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

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
  const { user, loading: autLoading } = useProtectedUser()

  const conditions = [
    'Diabetes', 'High Blood Pressure', 'Asthma', 'Heart Disease', 
    'Arthritis', 'Kidney Disease', 'Thyroid Issues', 'Mental Health'
  ]

  const languages = ['English', 'Hindi', 'Spanish', 'French', 'Other']

  // Validation rules
  const validateField = (name, value) => {
    const errors = {}

    switch (name) {
      case 'age':
        if (!value) {
          errors.age = 'Age is required'
        } else if (isNaN(value) || value < 1 || value > 150) {
          errors.age = 'Please enter a valid age between 1 and 150'
        }
        break

      case 'gender':
        if (!value) {
          errors.gender = 'Please select your gender'
        }
        break

      case 'emergencyContactName':
        if (!value.trim()) {
          errors.emergencyContactName = 'Emergency contact name is required'
        } else if (value.trim().length < 2) {
          errors.emergencyContactName = 'Name must be at least 2 characters long'
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.emergencyContactName = 'Name should only contain letters and spaces'
        }
        break

      case 'emergencyContactPhone':
        if (!value.trim()) {
          errors.emergencyContactPhone = 'Emergency contact phone is required'
        } else {
          // Remove all non-digits for validation
          const phoneDigits = value.replace(/\D/g, '')
          if (phoneDigits.length < 10) {
            errors.emergencyContactPhone = 'Phone number must be at least 10 digits'
          } else if (phoneDigits.length > 15) {
            errors.emergencyContactPhone = 'Phone number cannot exceed 15 digits'
          } else if (!/^[\d\s\-\+\(\)]+$/.test(value.trim())) {
            errors.emergencyContactPhone = 'Please enter a valid phone number'
          }
        }
        break

      case 'location':
        if (value && value.trim().length > 0 && value.trim().length < 2) {
          errors.location = 'Location must be at least 2 characters long'
        }
        break

      default:
        break
    }

    return errors
  }

  // Validate current step
  const validateStep = (stepNumber) => {
    const stepErrors = {}

    switch (stepNumber) {
      case 1:
        Object.assign(stepErrors, validateField('age', formData.age))
        Object.assign(stepErrors, validateField('gender', formData.gender))
        break
      case 3:
        Object.assign(stepErrors, validateField('emergencyContactName', formData.emergencyContactName))
        Object.assign(stepErrors, validateField('emergencyContactPhone', formData.emergencyContactPhone))
        Object.assign(stepErrors, validateField('location', formData.location))
        break
      default:
        break
    }

    return stepErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value
    })

    // Mark field as touched
    setTouched({
      ...touched,
      [name]: true
    })

    // Validate field and update errors
    const fieldErrors = validateField(name, value)
    setErrors(prevErrors => ({
      ...prevErrors,
      ...fieldErrors,
      // Clear error if field is now valid
      ...(Object.keys(fieldErrors).length === 0 && { [name]: undefined })
    }))
  }



  const handleBlur = (e) => {
    const { name, value } = e.target
    
    setTouched({
      ...touched,
      [name]: true
    })

    const fieldErrors = validateField(name, value)
    setErrors(prevErrors => ({
      ...prevErrors,
      ...fieldErrors
    }))
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
    const stepErrors = validateStep(step)
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(prevErrors => ({
        ...prevErrors,
        ...stepErrors
      }))
      
      // Mark all fields in current step as touched
      const stepFields = getStepFields(step)
      const newTouched = { ...touched }
      stepFields.forEach(field => {
        newTouched[field] = true
      })
      setTouched(newTouched)
      
      return
    }

    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const getStepFields = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return ['age', 'gender']
      case 2:
        return []
      case 3:
        return ['emergencyContactName', 'emergencyContactPhone', 'location']
      default:
        return []
    }
  }

  const handleSubmit = async () => {
    // Final validation
    const allErrors = validateStep(3)
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(prevErrors => ({
        ...prevErrors,
        ...allErrors
      }))
      
      // Mark all required fields as touched
      const finalTouched = { ...touched }
      getStepFields(3).forEach(field => {
        finalTouched[field] = true
      })
      setTouched(finalTouched)
      
      return
    }

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
            emergency_contact_name: formData.emergencyContactName.trim(),
            emergency_contact_phone: formData.emergencyContactPhone.trim(),
            location: formData.location.trim() || null,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        if (error.code === '23505') {
          throw new Error('Profile already exists. Please contact support.')
        }
        throw error
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      setErrors({ submit: error.message || 'Error saving profile. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to check if current step is valid
  const isStepValid = (stepNumber) => {
    const stepErrors = validateStep(stepNumber)
    return Object.keys(stepErrors).length === 0
  }

  // Helper function to get error message for a field
  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : null
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
            Let&apos;s set up your health profile
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
          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Enter your age"
                    min="1"
                    max="150"
                    className={getFieldError('age') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {getFieldError('age') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      {getFieldError('age')}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full text-black px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      getFieldError('gender') 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {getFieldError('gender') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      {getFieldError('gender')}
                    </p>
                  )}
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
              
              <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  This information is kept private and used only to personalize your health tips
                </p>
              </div>
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
                <div>
                  <Input
                    label="Emergency Contact Name"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Enter contact person's name"
                    className={getFieldError('emergencyContactName') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {getFieldError('emergencyContactName') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      {getFieldError('emergencyContactName')}
                    </p>
                  )}
                </div>
                
                <div>
                  <Input
                    label="Emergency Contact Phone"
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Enter phone number"
                    className={getFieldError('emergencyContactPhone') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {getFieldError('emergencyContactPhone') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      {getFieldError('emergencyContactPhone')}
                    </p>
                  )}
                </div>
                
                <div>
                  <Input
                    label="Your Location (City/Area)"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Mumbai, Maharashtra"
                    icon={<MapPin className="h-4 w-4" />}
                    className={getFieldError('location') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {getFieldError('location') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      {getFieldError('location')}
                    </p>
                  )}
                </div>
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
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading }
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