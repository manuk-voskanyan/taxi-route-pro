import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

// GET - Get average rating for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const reviewType = searchParams.get('reviewType') // 'driver_review' or 'passenger_review'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Build query
    let query = '*[_type == "rating" && reviewee._ref == $userId && status == "active" && isPublic == true'
    let params = { userId }

    if (reviewType) {
      query += ' && reviewType == $reviewType'
      params.reviewType = reviewType
    }

    query += ']'

    const ratings = await client.fetch(`${query}{
      rating,
      reviewType,
      reviewCategories,
      createdAt,
      reviewer->{
        _id,
        name,
        userType
      }
    }`, params)

    if (ratings.length === 0) {
      return NextResponse.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categoryAverages: {},
        recentReviews: []
      })
    }

    // Calculate average rating
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratings.forEach(r => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1
    })

    // Calculate category averages
    const categoryAverages = {}
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

    // Get recent reviews (last 5)
    const recentReviews = ratings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(r => ({
        rating: r.rating,
        reviewType: r.reviewType,
        createdAt: r.createdAt,
        reviewer: r.reviewer
      }))

    return NextResponse.json({
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: ratings.length,
      ratingDistribution,
      categoryAverages,
      recentReviews
    })

  } catch (error) {
    console.error('Error fetching average rating:', error)
    return NextResponse.json({ error: 'Failed to fetch average rating' }, { status: 500 })
  }
}
