// app/api/symptom-checker/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { symptoms, userId } = await request.json()

    if (!symptoms || !userId) {
      return NextResponse.json(
        { error: 'Symptoms and user ID are required' },
        { status: 400 }
      )
    }

    // Get user profile for personalized response
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Create personalized prompt
    const prompt = `
As a healthcare AI assistant, analyze these symptoms and provide helpful guidance. Remember this is for informational purposes only and not a replacement for professional medical advice.

Patient Context:
- Age: ${profile?.age || 'Not specified'}
- Gender: ${profile?.gender || 'Not specified'}
- Existing Conditions: ${profile?.existing_conditions?.join(', ') || 'None specified'}
- Language: ${profile?.preferred_language || 'English'}

Symptoms Described: "${symptoms}"

Please provide a response in JSON format with the following structure:
{
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "severity": "low|medium|high|emergency",
  "recommendations": {
    "immediate": ["immediate action 1", "immediate action 2"],
    "general": ["general advice 1", "general advice 2"],
    "whenToSeekHelp": "description of when to see a doctor"
  },
  "warningSigns": ["warning sign 1", "warning sign 2"],
  "disclaimer": "This is AI-generated information and should not replace professional medical advice"
}

Focus on:
1. Most likely conditions based on symptoms
2. Appropriate severity level
3. Practical, actionable advice
4. Clear warning signs that require immediate medical attention
5. When to consult a healthcare provider

Be culturally sensitive and provide advice suitable for underserved communities with limited healthcare access.
`



 const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let aiResponse
    try {
      // Try to parse JSON response
      aiResponse = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
    } catch (parseError) {
      // Fallback if JSON parsing fails
      aiResponse = {
        possibleConditions: ['Unable to determine specific conditions'],
        severity: 'medium',
        recommendations: {
          immediate: ['Rest and monitor symptoms'],
          general: ['Stay hydrated', 'Get adequate rest'],
          whenToSeekHelp: 'If symptoms worsen or persist for more than 24-48 hours'
        },
        warningSignsigns: ['Difficulty breathing', 'Severe pain', 'High fever'],
        disclaimer: 'This is AI-generated information and should not replace professional medical advice',
        rawResponse: text
      }
    }

    // Save to database
    const { data: savedCheck, error: saveError } = await supabase
      .from('symptom_checks')
      .insert([
        {
          user_id: userId,
          symptoms_description: symptoms,
          ai_response: aiResponse,
          severity_level: aiResponse.severity
        }
      ])
      .select()
      .single()

    if (saveError) {
      console.error('Error saving symptom check:', saveError)
    }

    return NextResponse.json({
      success: true,
      data: aiResponse,
      checkId: savedCheck?.id
    })

  } catch (error) {
  console.error('Symptom checker error:', error?.message || error)
  return NextResponse.json(
    { error: error?.message || 'Failed to analyze symptoms' },
    { status: 500 }
  )
}

}

// Get symptom check history
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit')) || 10

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: checks, error } = await supabase
      .from('symptom_checks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: checks
    })

  } catch (error) {
    console.error('Error fetching symptom history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch symptom history' },
      { status: 500 }
    )
  }
}