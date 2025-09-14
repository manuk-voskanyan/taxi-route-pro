import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { client } from '@/sanity/lib/client'

// GET - Fetch ratings for a user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'received', 'given', or 'all'
    const reviewType = searchParams.get('reviewType') // 'driver_review' or 'passenger_review'
    const limit = searchParams.get('limit')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Build query based on parameters
    let query = '*[_type == "rating" && status == "active"'
    let params = {}

    if (type === 'received') {
      query += ' && reviewee._ref == $userId'
      params.userId = userId
    } else if (type === 'given') {
      query += ' && reviewer._ref == $userId'
      params.userId = userId
    } else {
      // Default to received ratings
      query += ' && reviewee._ref == $userId'
      params.userId = userId
    }

    if (reviewType) {
      query += ' && reviewType == $reviewType'
      params.reviewType = reviewType
    }

    query += '] | order(createdAt desc)'
    
    if (limit) {
      query += `[0...${parseInt(limit)}]`
    }

    const ratings = await client.fetch(`${query}{
      _id,
      rating,
      reviewType,
      comment,
      reviewCategories,
      isAnonymous,
      isPublic,
      tripDate,
      createdAt,
      reviewer->{
        _id,
        name,
        avatar,
        userType
      },
      reviewee->{
        _id,
        name,
        avatar,
        userType
      },
      trip->{
        _id,
        fromCity,
        toCity,
        departureDate
      }
    }`, params)

    // Calculate average rating for the user
    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      const categoryAverages = {}

      // Calculate category averages
      ratings.forEach(rating => {
        if (rating.reviewCategories) {
          Object.entries(rating.reviewCategories).forEach(([key, value]) => {
            if (value && typeof value === 'number') {
              if (!categoryAverages[key]) {
                categoryAverages[key] = { sum: 0, count: 0 }
              }
              categoryAverages[key].sum += value
              categoryAverages[key].count += 1
            }
          })
        }
      })

      // Convert to averages
      Object.keys(categoryAverages).forEach(key => {
        categoryAverages[key] = Math.round((categoryAverages[key].sum / categoryAverages[key].count) * 10) / 10
      })

      return NextResponse.json({
        ratings,
        summary: {
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: ratings.length,
          categoryAverages
        }
      })
    }

    return NextResponse.json({
      ratings: [],
      summary: {
        averageRating: 0,
        totalReviews: 0,
        categoryAverages: {}
      }
    })

  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

// POST - Submit a new rating
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      tripId,
      revieweeId,
      rating,
      reviewType,
      comment,
      reviewCategories,
      isAnonymous = false,
      isPublic = true,
      tripDate
    } = body

    // Only validate truly essential fields
    const missingFields = []
    if (!tripId) missingFields.push('Trip ID')
    if (!revieweeId) missingFields.push('Reviewee ID')  
    if (!reviewType) missingFields.push('Review Type')

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 })
    }

    // Provide default values for optional fields
    const finalRating = rating || 5
    const finalTripDate = tripDate || new Date().toISOString().split('T')[0]

    // Validate rating range
    if (finalRating < 1 || finalRating > 5) {
      return NextResponse.json({
        error: 'Rating must be between 1 and 5'
      }, { status: 400 })
    }

    // Validate review type
    if (!['driver_review', 'passenger_review'].includes(reviewType)) {
      return NextResponse.json({
        error: 'Invalid review type'
      }, { status: 400 })
    }

    // Check if user has already rated this person for this trip
    const existingRating = await client.fetch(
      `*[_type == "rating" && trip._ref == $tripId && reviewer._ref == $reviewerId && reviewee._ref == $revieweeId][0]`,
      {
        tripId,
        reviewerId: session.user.id,
        revieweeId
      }
    )

    // If rating exists, update it instead of creating new one
    if (existingRating) {
      const updatedRatingDoc = {
        rating: parseInt(finalRating),
        comment: comment?.trim() || '',
        reviewCategories: reviewCategories || {},
        isAnonymous: Boolean(isAnonymous),
        isPublic: Boolean(isPublic),
        tripDate: finalTripDate,
        updatedAt: new Date().toISOString()
      }

      const result = await client.patch(existingRating._id).set(updatedRatingDoc).commit()

      // Fetch the complete updated rating
      const completeRating = await client.fetch(
        `*[_id == "${result._id}"][0]{
          _id,
          rating,
          reviewType,
          comment,
          reviewCategories,
          isAnonymous,
          isPublic,
          tripDate,
          createdAt,
          reviewer->{_id, name, avatar},
          reviewee->{_id, name, avatar},
          trip->{_id, fromCity, toCity}
        }`
      )

      return NextResponse.json({
        message: 'Rating updated successfully',
        data: completeRating
      })
    }

    // Basic validation - just verify the trip exists
    const trip = await client.fetch(
      `*[_type == "trip" && _id == $tripId][0]{
        _id,
        driver->{_id}
      }`,
      { tripId }
    )

    if (!trip) {
      return NextResponse.json({
        error: 'Trip not found'
      }, { status: 404 })
    }

    // Simple validation - don't allow users to rate themselves
    if (session.user.id === revieweeId) {
      return NextResponse.json({
        error: 'You cannot rate yourself'
      }, { status: 403 })
    }

    // Create rating document
    const ratingDoc = {
      _type: 'rating',
      trip: {
        _type: 'reference',
        _ref: tripId
      },
      reviewer: {
        _type: 'reference',
        _ref: session.user.id
      },
      reviewee: {
        _type: 'reference',
        _ref: revieweeId
      },
      rating: parseInt(finalRating),
      reviewType,
      comment: comment?.trim() || '',
      reviewCategories: reviewCategories || {},
      isAnonymous: Boolean(isAnonymous),
      isPublic: Boolean(isPublic),
      tripDate: finalTripDate,
      createdAt: new Date().toISOString(),
      status: 'active'
    }

    const result = await client.create(ratingDoc)

    // Fetch the complete rating with populated references
    const completeRating = await client.fetch(
      `*[_id == "${result._id}"][0]{
        _id,
        rating,
        reviewType,
        comment,
        reviewCategories,
        isAnonymous,
        isPublic,
        tripDate,
        createdAt,
        reviewer->{_id, name, avatar},
        reviewee->{_id, name, avatar},
        trip->{_id, fromCity, toCity}
      }`
    )

    return NextResponse.json({
      message: 'Rating submitted successfully',
      data: completeRating
    })

  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }
}
