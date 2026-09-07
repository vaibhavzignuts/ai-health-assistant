import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET Saved Facilities
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('saved_facilities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching saved facilities:', error);
    return NextResponse.json({ error: 'Failed to fetch saved facilities' }, { status: 500 });
  }
}

// SAVE a Facility
export async function POST(request) {
  try {
    const { userId, facilityId, name, type, address, phone } = await request.json();

    if (!userId || !facilityId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('saved_facilities')
      .upsert([{
        user_id: userId,
        facility_id: facilityId,
        name,
        type: type || 'Medical Center',
        address,
        phone
      }], { onConflict: 'user_id, facility_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving facility:', error);
    return NextResponse.json({ error: 'Failed to save facility' }, { status: 500 });
  }
}

// UNSAVE a Facility
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Internal DB ID of the saved record
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID and User ID are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('saved_facilities')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsaving facility:', error);
    return NextResponse.json({ error: 'Failed to unsave facility' }, { status: 500 });
  }
}
