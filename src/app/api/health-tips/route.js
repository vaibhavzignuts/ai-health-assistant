// app/api/health-tips/route.js
import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/server/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // This bypasses RLS
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
export async function POST(request) {
  try {
    const { userId, category } = await request.json()



    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user profile for personalized response
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()



    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Rest of your code remains the same...
// Update the prompt to focus on the selected category
const prompt = `As a healthcare AI assistant, provide personalized health tips ONLY for the ${category} category for a patient with the following profile:

Patient Context:
- Age: ${profile.age || 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- Existing Conditions: ${profile.existing_conditions?.join(', ') || 'None specified'}
- Location: ${profile.location || 'Not specified'}

Please provide health tips in JSON format EXCLUSIVELY for the ${category} category with the following structure:

${
  category === 'general' ? `{
  "generalTips": [
    {
      "title": "tip title",
      "description": "detailed tip description",
      "category": "diet|exercise|lifestyle|medication|monitoring",
      "priority": "high|medium|low"
    }
  ],
  "warningSignsToWatch": ["warning sign 1", "warning sign 2"],
  "disclaimer": "medical disclaimer"
}` : ''
}

${
  category === 'diet' ? `{
  "dietaryRecommendations": {
    "recommended": ["food 1", "food 2"],
    "avoid": ["food 1", "food 2"],
    "mealPlan": {
      "breakfast": "suggestion",
      "lunch": "suggestion",
      "dinner": "suggestion",
      "snacks": "suggestion"
    }
  },
  "disclaimer": "medical disclaimer"
}` : ''
}

${
  category === 'exercise' ? `{
  "exerciseGuidelines": {
    "recommended": ["exercise 1", "exercise 2"],
    "avoid": ["exercise 1", "exercise 2"],
    "duration": "recommended duration",
    "frequency": "recommended frequency"
  },
  "disclaimer": "medical disclaimer"
}` : ''
}

${
  category === 'mental' ? `{
  "lifestyleModifications": [
    {
      "category": "stress|mindfulness|habits",
      "recommendation": "specific advice",
      "implementation": "how to implement"
    }
  ],
  "disclaimer": "medical disclaimer"
}` : ''
}

${
  category === 'preventive' ? `{
  "conditionSpecificTips": [
    {
      "condition": "condition name",
      "tips": [
        {
          "title": "preventive measure",
          "description": "detailed description"
        }
      ]
    }
  ],
  "monitoringAdvice": [
    {
      "parameter": "what to monitor",
      "frequency": "how often",
      "normalRange": "normal values",
      "whenToAlert": "when to seek help"
    }
  ],
  "disclaimer": "medical disclaimer"
}` : ''
}

Focus on:
1. Practical, actionable tips specifically for ${category}
2. Cultural and regional considerations for ${profile.location}
3. Age and gender-appropriate recommendations
4. Integration of existing conditions if relevant to ${category}

Be specific and practical.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let aiResponse
    try {
      // Try to parse JSON response
      aiResponse = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // Your fallback response code...
      aiResponse = {
        generalTips: [
          {
            title: "Stay Hydrated",
            description: "Drink at least 8 glasses of water daily to maintain good health",
            category: "lifestyle",
            priority: "high"
          },
          {
            title: "Regular Exercise",
            description: "Engage in moderate physical activity for at least 30 minutes daily",
            category: "exercise",
            priority: "high"
          }
        ],
        conditionSpecificTips: [],
        dietaryRecommendations: {
          recommended: ["Fruits", "Vegetables", "Whole grains"],
          avoid: ["Processed foods", "Excessive salt", "Sugary drinks"],
          mealPlan: {
            breakfast: "Oatmeal with fruits",
            lunch: "Balanced meal with vegetables",
            dinner: "Light dinner with lean protein",
            snacks: "Nuts and fruits"
          }
        },
        exerciseGuidelines: {
          recommended: ["Walking", "Swimming", "Yoga"],
          avoid: ["High-intensity workouts without medical clearance"],
          duration: "30 minutes",
          frequency: "5 days a week"
        },
        monitoringAdvice: [],
        lifestyleModifications: [
          {
            category: "sleep",
            recommendation: "Get 7-9 hours of quality sleep",
            implementation: "Maintain consistent sleep schedule"
          }
        ],
        warningSignsToWatch: ["Unusual fatigue", "Persistent symptoms"],
        medicationReminders: [
          {
            general: "Take medications as prescribed",
            timing: "Follow prescribed schedule",
            interactions: "Avoid alcohol with medications"
          }
        ],
        emergencyGuidelines: {
          whenToCall: "If experiencing severe symptoms",
          emergencyContact: "Contact your emergency contact",
          immediateActions: ["Stay calm", "Call for help"]
        },
        disclaimer: "This is AI-generated information for educational purposes only and should not replace professional medical advice.",
        rawResponse: text
      }
    }

    // Save to database
    const { data: savedTips, error: saveError } = await supabase
      .from('health_tips_history')
      .insert([
        {
          user_id: userId,
          tips_data: aiResponse,
          category: category || 'general',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (saveError) {
      console.error('Error saving health tips:', saveError)
    }

    return NextResponse.json({
      success: true,
      data: aiResponse,
      tipId: savedTips?.id
    })

  } catch (error) {
    console.error('Health tips error:', error?.message || error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate health tips' },
      { status: 500 }
    )
  }
}
// Get health tips history
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

    const { data: tips, error } = await supabase
      .from('health_tips_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: tips
    })

  } catch (error) {
    console.error('Error fetching health tips history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch health tips history' },
      { status: 500 }
    )
  }
}