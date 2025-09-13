import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { client } from '@/sanity/lib/client'
import { mockTripStorage } from '@/lib/mock-storage'

// Check if we should use mock storage
const useMockStorage = !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 
                      !process.env.SANITY_API_WRITE_TOKEN

// GET /api/my-trips - Get current user's trips (drivers only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Պահանջվում է նույնականացում' },
        { status: 401 }
      )
    }

    if (session.user.userType !== 'driver') {
      return NextResponse.json(
        { error: 'Միայն վարորդները կարող են դիտել իրենց ճանապարհորդությունները' },
        { status: 403 }
      )
    }

    let trips
    if (useMockStorage) {
      // Get all trips and filter by driver
      const allTrips = await mockTripStorage.findAll({})
      trips = allTrips.filter(trip => trip.driverId === session.user.id)
    } else {
      trips = await client.fetch(
        `*[_type == "trip" && driver._ref == $driverId]{
          _id,
          fromCity,
          toCity,
          departureDate,
          departureTime,
          availableSeats,
          totalSeats,
          pricePerSeat,
          currency,
          description,
          stops,
          status,
          passengers[]{
            passenger->{
              _id,
              name,
              email,
              phone
            },
            seatsBooked,
            bookingDate,
            status
          },
          createdAt,
          updatedAt
        } | order(departureDate desc)`,
        { driverId: session.user.id }
      )
    }

    return NextResponse.json({ trips })
  } catch (error) {
    console.error('Error fetching user trips:', error)
    return NextResponse.json(
      { error: 'Չհաջողվեց բեռնել ճանապարհորդությունները' },
      { status: 500 }
    )
  }
}
