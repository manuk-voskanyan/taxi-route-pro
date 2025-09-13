import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { client } from '@/sanity/lib/client'
import { mockTripStorage } from '@/lib/mock-storage'

// Check if we should use mock storage
const useMockStorage = !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 
                      !process.env.SANITY_API_WRITE_TOKEN

// PUT /api/trips/[id] - Update a trip
export async function PUT(request, { params }) {
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
        { error: 'Only drivers can update trips' },
        { status: 403 }
      )
    }

    const tripId = params.id
    const updateData = await request.json()
    
    // Validate required fields
    const { fromCity, toCity, departureDate, departureTime, totalSeats, pricePerSeat } = updateData
    
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

    let updatedTrip
    if (useMockStorage) {
      // Get the trip first to verify ownership
      const existingTrip = await mockTripStorage.findById(tripId)
      if (!existingTrip) {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        )
      }

      if (existingTrip.driverId !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only update your own trips' },
          { status: 403 }
        )
      }

      // Update the trip
      const updatedData = {
        ...existingTrip,
        fromCity: fromCity.trim(),
        toCity: toCity.trim(),
        departureDate,
        departureTime,
        totalSeats: parseInt(totalSeats),
        availableSeats: Math.min(existingTrip.availableSeats, parseInt(totalSeats)), // Don't exceed new total
        pricePerSeat: parseFloat(pricePerSeat),
        currency: updateData.currency || 'USD',
        description: updateData.description?.trim() || '',
        stops: updateData.stops?.filter(stop => stop.trim() !== '') || [],
        updatedAt: new Date().toISOString()
      }

      updatedTrip = await mockTripStorage.update(tripId, updatedData)
    } else {
      // First verify the trip exists and belongs to the user
      const existingTrip = await client.fetch(
        `*[_type == "trip" && _id == $tripId && driver._ref == $driverId][0]`,
        { tripId, driverId: session.user.id }
      )

      if (!existingTrip) {
        return NextResponse.json(
          { error: 'Trip not found or you do not have permission to update it' },
          { status: 404 }
        )
      }

      // Update the trip
      const updatedData = {
        fromCity: fromCity.trim(),
        toCity: toCity.trim(),
        departureDate,
        departureTime,
        totalSeats: parseInt(totalSeats),
        // Don't allow reducing available seats below current bookings
        availableSeats: Math.min(existingTrip.availableSeats, parseInt(totalSeats)),
        pricePerSeat: parseFloat(pricePerSeat),
        currency: updateData.currency || 'USD',
        description: updateData.description?.trim() || '',
        stops: updateData.stops?.filter(stop => stop.trim() !== '') || [],
        updatedAt: new Date().toISOString()
      }

      await client.patch(tripId).set(updatedData).commit()

      // Fetch the updated trip with driver info
      updatedTrip = await client.fetch(
        `*[_id == "${tripId}"][0]{
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
          driver->{_id, name, avatar},
          createdAt,
          updatedAt
        }`
      )
    }

    return NextResponse.json({ 
      message: 'Trip updated successfully', 
      trip: updatedTrip 
    })
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    )
  }
}

// DELETE /api/trips/[id] - Cancel/Delete a trip
export async function DELETE(request, { params }) {
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
        { error: 'Only drivers can delete trips' },
        { status: 403 }
      )
    }

    const tripId = params.id

    if (useMockStorage) {
      // Get the trip first to verify ownership
      const existingTrip = await mockTripStorage.findById(tripId)
      if (!existingTrip) {
        return NextResponse.json(
          { error: 'Trip not found' },
          { status: 404 }
        )
      }

      if (existingTrip.driverId !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only delete your own trips' },
          { status: 403 }
        )
      }

      // Update status to cancelled instead of actual deletion
      await mockTripStorage.update(tripId, { 
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })
    } else {
      // First verify the trip exists and belongs to the user
      const existingTrip = await client.fetch(
        `*[_type == "trip" && _id == $tripId && driver._ref == $driverId][0]`,
        { tripId, driverId: session.user.id }
      )

      if (!existingTrip) {
        return NextResponse.json(
          { error: 'Trip not found or you do not have permission to delete it' },
          { status: 404 }
        )
      }

      // Update status to cancelled instead of actual deletion
      await client.patch(tripId).set({ 
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      }).commit()
    }

    return NextResponse.json({ 
      message: 'Trip cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling trip:', error)
    return NextResponse.json(
      { error: 'Failed to cancel trip' },
      { status: 500 }
    )
  }
}
