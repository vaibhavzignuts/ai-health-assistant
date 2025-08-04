import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const city = searchParams.get('city')
    const facilityType = searchParams.get('type') || 'all'
    const radius = parseInt(searchParams.get('radius')) || 10

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      )
    }

    let query = supabase.from('healthcare_facilities').select('*')

    // Filter by city (exact match for better results)
    query = query.eq('city', city)

    // Filter by facility type if specified
    if (facilityType !== 'all') {
      query = query.eq('type', facilityType)
    }

    const { data: facilities, error } = await query.order('name')

    if (error) throw error

    let results = facilities || []

    // Sort by emergency services first, then by name
    results = results.sort((a, b) => {
      // Emergency services first
      if (a.emergency_services && !b.emergency_services) return -1
      if (!a.emergency_services && b.emergency_services) return 1
      
      // Then by rating (higher first)
      if (b.rating !== a.rating) return b.rating - a.rating
      
      // Finally by name
      return a.name.localeCompare(b.name)
    })

    // Save search history
    await supabase
      .from('user_facility_searches')
      .insert([
        {
          user_id: userId,
          search_location: city,
          facility_type: facilityType,
          search_radius: radius,
          results_count: results.length
        }
      ])

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      city: city
    })

  } catch (error) {
    console.error('Facility finder error:', error)
    return NextResponse.json(
      { error: 'Failed to find facilities' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { userId, limit = 10 } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: searches, error } = await supabase
      .from('user_facility_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: searches
    })

  } catch (error) {
    console.error('Error fetching search history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    )
  }
}
