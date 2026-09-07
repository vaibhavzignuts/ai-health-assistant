import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { symptoms, userId } = await request.json();
    
    if (!symptoms || !userId) {
      return NextResponse.json({ error: 'Symptoms description and user ID are required' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const prompt = `As a healthcare AI assistant, analyze these symptoms and provide helpful guidance.
CRITICAL SAFETY RULE: You are not a doctor. Never provide a definitive diagnosis. Always frame conditions as "Possible causes to discuss with a healthcare professional".

Patient Context:
- Age: ${profile?.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 'Not specified'}
- Gender: ${profile?.gender || 'Not specified'}
- Existing Conditions: ${profile?.existing_conditions || 'None specified'}
- Allergies: ${profile?.allergies || 'None specified'}

Symptoms Described: "${symptoms}"

Please provide a response in JSON format with the following structure:
{
  "isValidSymptom": true,
  "possibleConditions": ["condition1", "condition2"],
  "urgencyLevel": "emergency" | "urgent" | "routine",
  "recommendedNextStep": "A single clear sentence on what to do next",
  "recommendations": {
    "immediate": ["action 1", "action 2"],
    "general": ["advice 1", "advice 2"],
    "whenToSeekHelp": "description of when to see a doctor"
  },
  "warningSigns": ["warning sign 1", "warning sign 2"]
}

Guidelines for urgencyLevel:
- "emergency": Life-threatening. Should output "Seek emergency medical care now." as recommendedNextStep.
- "urgent": Needs prompt attention. Should output "Consider contacting a healthcare professional promptly."
- "routine": Non-urgent. Should output "Consider scheduling a healthcare appointment."

If the input is not a valid medical symptom, set "isValidSymptom": false and leave the rest empty.`;

    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let aiResponse;
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      aiResponse = JSON.parse(cleanedText);
      
      if (aiResponse.isValidSymptom === false) {
        return NextResponse.json(
          { error: 'Please describe actual medical symptoms' },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: aiResponse
    });

  } catch (error) {
    console.error('Symptom checker error:', error);
    return NextResponse.json({ error: 'Failed to analyze symptoms.' }, { status: 500 });
  }
}