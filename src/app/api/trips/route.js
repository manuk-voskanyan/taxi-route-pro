import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { client } from '@/sanity/lib/client'
import { mockTripStorage } from '@/lib/mock-storage'

// Check if we should use mock storage (when Sanity isn't configured)
const useMockStorage = !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 
                      !process.env.SANITY_API_WRITE_TOKEN

// GET /api/trips - Get all trips with optional filters
export async function GET(request) {
  try {
    console.log(`Fetching trips using ${useMockStorage ? 'MOCK STORAGE' : 'SANITY'}`)
    
    const { searchParams } = new URL(request.url)
    const fromCity = searchParams.get('fromCity')
    const toCity = searchParams.get('toCity')
    const departureDate = searchParams.get('departureDate')
    const status = searchParams.get('status') || 'active'

    let trips
    if (useMockStorage) {
      trips = await mockTripStorage.findAll({
        fromCity,
        toCity,
        departureDate,
        status
      })
    } else {
      // Build GROQ query with filters
      let query = '*[_type == "trip"'
      let params = {}

      if (fromCity) {
        query += ' && fromCity match $fromCity'
        params.fromCity = `*${fromCity}*`
      }

      if (toCity) {
        query += ' && toCity match $toCity'
        params.toCity = `*${toCity}*`
      }

      if (departureDate) {
        query += ' && departureDate == $departureDate'
        params.departureDate = departureDate
      }

      query += ' && status == $status'
      params.status = status

      query += ']{ _id, fromCity, toCity, departureDate, departureTime, availableSeats, totalSeats, pricePerSeat, currency, description, stops, status, driver->{ _id, name, avatar{ asset->{ _id, url } }, driverInfo { licenseNumber, carModel, carColor, plateNumber, company, carImages[]{ asset->{ _id, url } } } }, createdAt } | order(departureDate asc, departureTime asc)'

      trips = await client.fetch(query, params)
    }

    return NextResponse.json({ trips })
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    )
  }
}

// POST /api/trips - Create new trip (drivers only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.userType !== 'driver') {
      return NextResponse.json(
        { error: 'Only drivers can create trips' },
        { status: 403 }
      )
    }

    const {
      fromCity,
      toCity,
      departureDate,
      departureTime,
      totalSeats,
      pricePerSeat,
      currency,
      description,
      stops
    } = await request.json()

    // Validate required fields
    if (!fromCity || !toCity || !departureDate || !departureTime || !totalSeats || !pricePerSeat) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate departure date is not in the past
    const today = new Date().toISOString().split('T')[0]
    if (departureDate < today) {
      return NextResponse.json(
        { error: 'Departure date cannot be in the past' },
        { status: 400 }
      )
    }

    // Create trip document
    const tripData = {
      _type: 'trip',
      driver: useMockStorage ? {
        _ref: session.user.id
      } : {
        _type: 'reference',
        _ref: session.user.id
      },
      driverId: session.user.id, // Add this for mock storage
      fromCity: fromCity.trim(),
      toCity: toCity.trim(),
      departureDate,
      departureTime,
      availableSeats: parseInt(totalSeats),
      totalSeats: parseInt(totalSeats),
      pricePerSeat: parseFloat(pricePerSeat),
      currency: currency || 'USD',
      description: description?.trim() || '',
      stops: stops?.filter(stop => stop.trim() !== '') || [],
      status: 'active',
      passengers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let newTrip
    if (useMockStorage) {
      newTrip = await mockTripStorage.create(tripData)
    } else {
      newTrip = await client.create(tripData)
    }

    return NextResponse.json(
      { 
        message: 'Trip created successfully',
        trip: newTrip
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
