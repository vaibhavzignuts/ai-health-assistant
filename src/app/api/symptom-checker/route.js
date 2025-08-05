// app/api/symptom-checker/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

 // Ensure this import is correct

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { symptoms, userId } = await request.json()
    
    if (!symptoms || !userId) {
      return NextResponse.json(
        { error: 'Symptoms description and user ID are required' },
        { status: 400 }
      )
    }

    // Enhanced symptom validation
    const isValidSymptom = validateSymptoms(symptoms)
    if (!isValidSymptom.valid) {
      return NextResponse.json(
        { 
          error: 'Please describe actual medical symptoms',
          message: isValidSymptom.message,
          examples: [
            "I have a headache and feel nauseous",
            "Experiencing chest pain and shortness of breath",
            "Running a fever with body aches",
            "Having stomach pain and diarrhea"
          ]
        },
        { status: 400 }
      )
    }

    // Get user profile for personalized response
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Enhanced personalized prompt (keeping original JSON format)
    const prompt = `As a healthcare AI assistant, analyze these symptoms and provide helpful guidance. Remember this is for informational purposes only and not a replacement for professional medical advice.

Patient Context:
- Age: ${profile?.age || 'Not specified'}
- Gender: ${profile?.gender || 'Not specified'}
- Existing Conditions: ${profile?.existing_conditions?.join(', ') || 'None specified'}
- Language: ${profile?.preferred_language || 'English'}

Symptoms Described: "${symptoms}"

IMPORTANT: First validate if the input describes genuine medical symptoms. If the input appears to be random text, greetings, test input, or non-medical content, respond with "isValidSymptom": false.

Please provide a response in JSON format with the following structure:
{
  "isValidSymptom": true,
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

Enhanced Guidelines:
1. Analyze symptoms comprehensively considering patient context
2. Provide more detailed and specific possible conditions
3. Give practical, actionable advice suitable for underserved communities
4. Include cultural sensitivity and economic considerations
5. Be more specific about severity assessment and warning signs
6. Consider symptom combinations and their clinical significance
7. Provide clear guidance on when to seek immediate vs routine care
8. Account for age, gender, and existing conditions in your analysis

Focus on:
1. Most likely conditions based on symptoms and patient profile
2. Appropriate severity level with reasoning
3. Practical, accessible advice for limited healthcare access
4. Clear warning signs that require immediate medical attention
5. Specific timeframes for when to consult healthcare providers

If input is not a valid medical symptom description, set "isValidSymptom": false and provide guidance.`

    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-2.5-flash'
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let aiResponse
    try {
      // Clean and parse JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
      aiResponse = JSON.parse(cleanedText)
      
      // Additional validation of AI response
      if (aiResponse.isValidSymptom === false) {
        return NextResponse.json(
          { 
            error: 'Please describe actual medical symptoms',
            message: 'The input provided does not appear to describe medical symptoms.',
            examples: [
              "headache",
              "chest pain and shortness of breath", 
              "fever and body aches",
              "stomach pain and nausea"
            ]
          },
          { status: 400 }
        )
      }
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // Enhanced fallback response (keeping original format)
      aiResponse = {
        isValidSymptom: true,
        possibleConditions: ['Unable to determine specific conditions'],
        severity: 'medium',
        recommendations: {
          immediate: ['Monitor symptoms closely'],
          general: ['Rest and stay hydrated', 'Get adequate rest'],
          whenToSeekHelp: 'If symptoms worsen, persist beyond 48 hours, or you feel concerned'
        },
        warningSigns: ['Difficulty breathing', 'Severe chest pain', 'High fever', 'Loss of consciousness'],
        disclaimer: 'This AI analysis encountered technical difficulties. Please consult a healthcare professional for proper evaluation.',
        rawResponse: text
      }
    }

    // Enhanced database saving with better error handling
    try {
      const { data: savedCheck, error: saveError } = await supabase
        .from('symptom_checks')
        .insert([
          {
            user_id: userId,
            symptoms_description: symptoms,
            ai_response: aiResponse,
            severity_level: aiResponse.severity,
            timestamp: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (saveError) {
        console.error('Database save error:', saveError)
        // Continue with response even if save fails
      }

      return NextResponse.json({
        success: true,
        data: aiResponse,
        checkId: savedCheck?.id || null,
        timestamp: new Date().toISOString()
      })

    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      // Return analysis even if database save fails
      return NextResponse.json({
        success: true,
        data: aiResponse,
        warning: 'Analysis completed but may not have been saved',
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Symptom checker error:', error?.message || error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze symptoms. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

function validateSymptoms(input) {
  // Basic validation checks
  if (!input || typeof input !== 'string') {
    return { valid: false, message: 'Please provide a symptom description' }
  }

  const cleanInput = input.trim().toLowerCase()
  
  // Check minimum length (reduced to 3 characters to allow single words like "headache")
  if (cleanInput.length < 3) {
    return { 
      valid: false, 
      message: 'Please provide a symptom description (at least 3 characters)' 
    }
  }

  // Common non-medical inputs to reject
  const invalidPatterns = [
    /^(hi|hello|hey|test|testing|abc|123|\d+)$/i,
    /^(nothing|none|no symptoms?)$/i,
    /^(how are you|what|why|when|where).*\?$/i,
    /^(good|bad|fine|ok|okay)$/i,
    /^random.*text/i,
    /^(asdf|qwerty|lorem ipsum)/i,
    /^[\W_]*$/  // Only special characters/whitespace
  ]

  for (const pattern of invalidPatterns) {
    if (pattern.test(cleanInput)) {
      return { 
        valid: false, 
        message: 'Please describe your actual medical symptoms' 
      }
    }
  }

  // Check for medical symptom keywords (positive indicators) - expanded list
  const medicalKeywords = [
    'pain', 'ache', 'hurt', 'sore', 'fever', 'temperature', 'hot', 'cold',
    'nausea', 'vomit', 'throw up', 'sick', 'dizzy', 'headache', 'migraine',
    'cough', 'sneeze', 'runny nose', 'congestion', 'throat', 'swallow',
    'stomach', 'belly', 'abdomen', 'chest', 'breathing', 'breath', 'tired',
    'fatigue', 'weakness', 'swelling', 'rash', 'itch', 'burn', 'sting',
    'bleed', 'discharge', 'diarrhea', 'constipation', 'cramp', 'spasm',
    'stiff', 'joint', 'muscle', 'bone', 'skin', 'eye', 'ear', 'nose',
    'mouth', 'tongue', 'tooth', 'gum', 'urinate', 'pee', 'bowel', 'sleep',
    'appetite', 'weight', 'pressure', 'palpitation', 'irregular', 'fast',
    'slow', 'numbness', 'tingling', 'sensation', 'feeling', 'allergy',
    'infection', 'inflammation', 'wound', 'injury', 'bruise', 'cut',
    'backache', 'shoulder', 'knee', 'ankle', 'wrist', 'neck', 'spine',
    'heartburn', 'indigestion', 'bloating', 'gas', 'hiccup', 'burp',
    'insomnia', 'restless', 'anxiety', 'stress', 'depression', 'mood',
    'memory', 'concentration', 'vision', 'hearing', 'balance', 'coordination'
  ]

  const hasValidKeywords = medicalKeywords.some(keyword => 
    cleanInput.includes(keyword)
  )

  // For very short inputs, be more lenient if they contain medical keywords
  if (cleanInput.length <= 15 && hasValidKeywords) {
    return { valid: true, message: 'Valid symptom description' }
  }

  if (!hasValidKeywords && cleanInput.length < 10) {
    return { 
      valid: false, 
      message: 'Please describe specific symptoms you are experiencing' 
    }
  }

  return { valid: true, message: 'Valid symptom description' }
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