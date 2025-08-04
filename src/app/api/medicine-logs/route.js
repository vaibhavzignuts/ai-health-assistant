// app/api/medicine-logs/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Get medicine logs for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const reminderId = searchParams.get('reminderId')
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit')) || 50

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('medicine_logs')
      .select(`
        *,
        medicine_reminders!inner(
          medicine_name,
          dosage
        )
      `)
      .eq('user_id', userId)
      .order('scheduled_time', { ascending: false })
      .limit(limit)

    if (reminderId) {
      query = query.eq('reminder_id', reminderId)
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      query = query
        .gte('scheduled_time', startDate.toISOString())
        .lt('scheduled_time', endDate.toISOString())
    }

    const { data: logs, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: logs
    })

  } catch (error) {
    console.error('Error fetching medicine logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medicine logs' },
      { status: 500 }
    )
  }
}

// Mark medicine as taken, missed, or skipped
export async function POST(request) {
  try {
    const { 
      userId, 
      reminderId, 
      scheduledTime, 
      status, 
      takenTime, 
      notes 
    } = await request.json()

    if (!userId || !reminderId || !scheduledTime || !status) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    if (!['taken', 'missed', 'skipped'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const logData = {
      user_id: userId,
      reminder_id: reminderId,
      scheduled_time: scheduledTime,
      status: status,
      notes: notes
    }

    if (status === 'taken') {
      logData.taken_time = takenTime || new Date().toISOString()
    }

    // Check if log already exists for this scheduled time
    const { data: existingLog } = await supabase
      .from('medicine_logs')
      .select('id')
      .eq('reminder_id', reminderId)
      .eq('scheduled_time', scheduledTime)
      .single()

    let result
    if (existingLog) {
      // Update existing log
      const { data: log, error } = await supabase
        .from('medicine_logs')
        .update(logData)
        .eq('id', existingLog.id)
        .select()
        .single()
      
      if (error) throw error
      result = log
    } else {
      // Create new log
      const { data: log, error } = await supabase
        .from('medicine_logs')
        .insert([logData])
        .select()
        .single()
      
      if (error) throw error
      result = log
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error updating medicine log:', error)
    console.log(error.message)
    return NextResponse.json(
      { error: 'Failed to update medicine log' },
      { status: 500 }
    )
  }
}

// Get today's medicine schedule
export async function PUT(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Get active reminders
    const { data: reminders, error: remindersError } = await supabase
      .from('medicine_reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('start_date', todayStr)
      .or(`end_date.is.null,end_date.gte.${todayStr}`)

    if (remindersError) {
      throw remindersError
    }

    // Generate today's schedule
    const todaysSchedule = []
    
    for (const reminder of reminders) {
      const times = Array.isArray(reminder.times) ? reminder.times : []
      
      for (const time of times) {
        const scheduledDateTime = new Date(`${todayStr}T${time}:00`)
        
        // Check if there's already a log for this scheduled time
        const { data: existingLog } = await supabase
          .from('medicine_logs')
          .select('*')
          .eq('reminder_id', reminder.id)
          .eq('scheduled_time', scheduledDateTime.toISOString())
          .single()

        todaysSchedule.push({
          reminder: reminder,
          scheduledTime: scheduledDateTime.toISOString(),
          status: existingLog?.status || 'pending',
          takenTime: existingLog?.taken_time || null,
          notes: existingLog?.notes || null,
          logId: existingLog?.id || null
        })
      }
    }

    // Sort by scheduled time
    todaysSchedule.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))

    return NextResponse.json({
      success: true,
      data: todaysSchedule
    })

  } catch (error) {
    console.error('Error generating today\'s schedule:', error)
    return NextResponse.json(
      { error: 'Failed to generate today\'s schedule' },
      { status: 500 }
    )
  }
}