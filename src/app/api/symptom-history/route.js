import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('symptom_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching symptom history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, symptomsEntered, followUpAnswers, aiAssessment, urgencyLevel, recommendedNextStep } = await request.json();

    if (!userId || !symptomsEntered || !aiAssessment || !urgencyLevel || !recommendedNextStep) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('symptom_assessments')
      .insert([{
        user_id: userId,
        symptoms_entered: symptomsEntered,
        follow_up_answers: followUpAnswers,
        ai_assessment: aiAssessment,
        urgency_level: urgencyLevel,
        recommended_next_step: recommendedNextStep
      }])
      .select()
      .single();

    if (error) throw error;

    // Log Activity
    await supabase.from('health_activity_logs').insert([{
      user_id: userId,
      activity_type: 'assessment_completed',
      title: 'Completed Symptom Assessment',
      description: `Urgency: ${urgencyLevel}`,
      related_entity_id: data.id
    }]);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving symptom assessment:', error);
    return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!assessmentId || !userId) {
      return NextResponse.json({ error: 'ID and User ID are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('symptom_assessments')
      .delete()
      .eq('id', assessmentId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 });
  }
}
