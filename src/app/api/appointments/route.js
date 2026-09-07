import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, providerName, facilityName, appointmentType, appointmentDate, location, isVirtual, notes } = await request.json();

    if (!userId || !providerName || !appointmentType || !appointmentDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        user_id: userId,
        provider_name: providerName,
        facility_name: facilityName,
        appointment_type: appointmentType,
        appointment_date: appointmentDate,
        location,
        is_virtual: isVirtual,
        notes
      }])
      .select()
      .single();

    if (error) throw error;

    // Log Activity
    await supabase.from('health_activity_logs').insert([{
      user_id: userId,
      activity_type: 'appointment_booked',
      title: 'Appointment Scheduled',
      description: `With ${providerName} on ${new Date(appointmentDate).toLocaleDateString()}`,
      related_entity_id: data.id
    }]);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: error.message || 'Failed to create appointment', details: error }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { userId, appointmentId, status } = await request.json();

    if (!userId || !appointmentId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log Activity
    await supabase.from('health_activity_logs').insert([{
      user_id: userId,
      activity_type: `appointment_${status}`,
      title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      description: `Appointment with ${data.provider_name} marked as ${status}`,
      related_entity_id: data.id
    }]);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
