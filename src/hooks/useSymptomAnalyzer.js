import { useState } from 'react'

export function useSymptomAnalyzer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)

  const analyzeSymptoms = async (symptoms, userId) => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
    const res = await fetch('/api/symptom-checker', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ symptoms, userId })
})

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Something went wrong')
      }

      setResponse(result.data)
      return {
        success: true,
        data: result.data,
        checkId: result.checkId
      }
    } catch (err) {
      setError(err.message || 'Unknown error')
      return {
        success: false,
        error: err.message
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    analyzeSymptoms,
    response,
    error,
    loading
  }
}
