'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Heart,
  Loader2,
  History,
  AlertCircle,
  Info
} from 'lucide-react'
import { getCurrentUser } from '../../../lib/auth'
import { useSymptomAnalyzer } from '../../../hooks/useSymptomAnalyzer'

export default function SymptomCheckerPage() {
  const [user, setUser] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
    const { analyzeSymptoms, response, error } = useSymptomAnalyzer()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
      } else {
        setUser(currentUser)
        loadHistory(currentUser.id)
      }
    }
    checkUser()
  }, [router])

  const loadHistory = async (userId) => {
    try {
      const response = await fetch(`/api/symptom-checker?userId=${userId}&limit=5`)
      const data = await response.json()
      if (data.success) {
        setHistory(data.data)
      }
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!symptoms.trim() || !user) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/symptom-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          userId: user.id
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
        loadHistory(user.id) // Refresh history
      } else {
        alert(data.error || 'Failed to analyze symptoms')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to analyze symptoms. Please try again.')
    } finally {
      setLoading(false)
    }
  }


//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     await analyzeSymptoms(symptoms, user.id)
//   }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'emergency': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-5 w-5" />
      case 'medium': return <Info className="h-5 w-5" />
      case 'high': return <AlertTriangle className="h-5 w-5" />
      case 'emergency': return <AlertCircle className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Symptom Checker</h1>
                <p className="text-sm text-gray-600">Get AI-powered health insights</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Important Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Important Medical Disclaimer</p>
              <p className="text-yellow-700">
                This AI tool provides general health information only and should not replace professional medical advice. 
                Always consult with a healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Symptom Input */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Describe Your Symptoms
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What symptoms are you experiencing?
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms in detail. For example: 'I have a headache, feel tired, and have a slight fever since yesterday morning...'"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be as specific as possible - include when symptoms started, their intensity, and any triggers.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !symptoms.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Analyzing symptoms...</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-5 w-5" />
                      <span>Analyze Symptoms</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-1 ${getSeverityColor(result.severity)}`}>
                    {getSeverityIcon(result.severity)}
                    <span className="capitalize">{result.severity} Priority</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Possible Conditions */}
                  {result.possibleConditions && result.possibleConditions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Possible Conditions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {result.possibleConditions.map((condition, index) => (
                          <li key={index} className="text-sm">{condition}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations && (
                    <div className="space-y-4">
                      {result.recommendations.immediate && result.recommendations.immediate.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span>Immediate Actions:</span>
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
                            {result.recommendations.immediate.map((action, index) => (
                              <li key={index} className="text-sm">{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.recommendations.general && result.recommendations.general.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">General Care:</h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {result.recommendations.general.map((advice, index) => (
                              <li key={index} className="text-sm">{advice}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.recommendations.whenToSeekHelp && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">When to Seek Medical Help:</h4>
                          <p className="text-sm text-blue-800">{result.recommendations.whenToSeekHelp}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Warning Signs */}
                  {result.warningSigns && result.warningSigns.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2 flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Seek Immediate Medical Attention If:</span>
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-red-800">
                        {result.warningSigns.map((sign, index) => (
                          <li key={index} className="text-sm">{sign}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 italic">
                      {result.disclaimer}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* History */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Checks</h3>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                >
                  <History className="h-4 w-4" />
                  <span>{showHistory ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              {showHistory && (
                <div className="space-y-3">
                  {history.length > 0 ? (
                    history.map((check) => (
                      <div key={check.id} className="border-l-4 border-blue-200 pl-3 py-2">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {check.symptoms_description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(check.severity_level)}`}>
                            {check.severity_level}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(check.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No previous checks found
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Emergency Numbers */}
            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Emergency Numbers</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-800">Ambulance:</span>
                  <a href="tel:102" className="text-red-600 font-medium">102</a>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-800">Fire:</span>
                  <a href="tel:101" className="text-red-600 font-medium">101</a>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-800">Police:</span>
                  <a href="tel:100" className="text-red-600 font-medium">100</a>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Tips for Better Results</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Describe symptoms in detail</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Mention when symptoms started</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Include severity and triggers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Always consult a doctor for serious concerns</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}