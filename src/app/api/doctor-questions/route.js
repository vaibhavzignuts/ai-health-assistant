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
      .from('doctor_questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching doctor questions:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor questions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, question } = await request.json();

    if (!userId || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('doctor_questions')
      .insert([{
        user_id: userId,
        question
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating doctor question:', error);
    return NextResponse.json({ error: 'Failed to create doctor question' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { userId, questionId, isResolved } = await request.json();

    if (!userId || !questionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('doctor_questions')
      .update({ is_resolved: isResolved })
      .eq('id', questionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating doctor question:', error);
    return NextResponse.json({ error: 'Failed to update doctor question' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID and User ID are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('doctor_questions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting doctor question:', error);
    return NextResponse.json({ error: 'Failed to delete doctor question' }, { status: 500 });
  }
}
