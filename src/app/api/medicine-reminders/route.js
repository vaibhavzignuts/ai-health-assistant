// app/api/medicine-reminders/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Get user's medicine reminders
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('medicine_reminders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: reminders, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: reminders
    })

  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

// Create new medicine reminder
export async function POST(request) {
  try {
    const { 
      userId, 
      medicineName, 
      dosage, 
      frequency, 
      times, 
      startDate, 
      endDate, 
      notes 
    } = await request.json()

    if (!userId || !medicineName || !dosage || !frequency || !times || !startDate) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    const { data: reminder, error } = await supabase
      .from('medicine_reminders')
      .insert([
        {
          user_id: userId,
          medicine_name: medicineName,
          dosage: dosage,
          frequency: frequency,
          times: times,
          start_date: startDate,
          end_date: endDate,
          notes: notes
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: reminder
    })

  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
}

// Update medicine reminder
export async function PUT(request) {
  try {
    const { 
      reminderId, 
      userId,
      medicineName, 
      dosage, 
      frequency, 
      times, 
      startDate, 
      endDate, 
      notes,
      isActive
    } = await request.json()

    if (!reminderId || !userId) {
      return NextResponse.json(
        { error: 'Reminder ID and User ID are required' },
        { status: 400 }
      )
    }

    const updateData = {}
    if (medicineName !== undefined) updateData.medicine_name = medicineName
    if (dosage !== undefined) updateData.dosage = dosage
    if (frequency !== undefined) updateData.frequency = frequency
    if (times !== undefined) updateData.times = times
    if (startDate !== undefined) updateData.start_date = startDate
    if (endDate !== undefined) updateData.end_date = endDate
    if (notes !== undefined) updateData.notes = notes
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: reminder, error } = await supabase
      .from('medicine_reminders')
      .update(updateData)
      .eq('id', reminderId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: reminder
    })

  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    )
  }
}

// Delete medicine reminder
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const reminderId = searchParams.get('reminderId')
    const userId = searchParams.get('userId')

    if (!reminderId || !userId) {
      return NextResponse.json(
        { error: 'Reminder ID and User ID are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('medicine_reminders')
      .delete()
      .eq('id', reminderId)
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Reminder deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    )
  }
}