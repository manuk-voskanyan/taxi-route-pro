'use client'

import { useState, useEffect } from 'react'
import StarRating from './star-rating'

export default function RatingDisplay({ userId, userType = null, showDetailed = false, limit = 5 }) {
  const [ratings, setRatings] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchRatings()
  }, [userId, userType, limit])

  const fetchRatings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Construct query parameters
      const params = new URLSearchParams({
        userId,
        type: 'received',
        ...(userType && { reviewType: userType === 'driver' ? 'driver_review' : 'passenger_review' }),
        ...(limit && !showAll && { limit: limit.toString() })
      })

      const response = await fetch(`/api/ratings?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch ratings')
      }

      setRatings(data.ratings || [])
      setSummary(data.summary || {})
    } catch (err) {
      console.error('Error fetching ratings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hy-AM', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const categoryLabels = {
    punctuality: 'Ճշգրտություն',
    communication: 'Հաղորդակցություն',
    cleanliness: 'Մաքրություն',
    drivingSkill: 'Վարչական հմտություն',
    politeness: 'Բարեկրթություն',
    reliability: 'Հուսալիություն'
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Սխալ՝ {error}
      </div>
    )
  }

  if (!summary || summary.totalReviews === 0) {
    return (
      <div className="text-gray-500 text-sm">
        Դեռ գնահատականներ չեն ստացվել
      </div>
    )
  }

  const displayedRatings = showAll ? ratings : ratings.slice(0, limit)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <StarRating
            rating={summary.averageRating}
            size="md"
            readonly={true}
            showText={true}
            totalReviews={summary.totalReviews}
          />
        </div>
        
        {showDetailed && summary.categoryAverages && Object.keys(summary.categoryAverages).length > 0 && (
          <div className="text-xs text-gray-500">
            • {Object.keys(summary.categoryAverages).length} կատեգորիա
          </div>
        )}
      </div>

      {/* Category Averages (detailed view) */}
      {showDetailed && summary.categoryAverages && Object.keys(summary.categoryAverages).length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-3">Կատեգորիական գնահատականներ</div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(summary.categoryAverages).map(([category, average]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{categoryLabels[category]}</span>
                <div className="flex items-center gap-1">
                  <StarRating rating={average} size="sm" readonly={true} />
                  <span className="text-xs text-gray-500">{average}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {displayedRatings.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-900">
            Վերջին գնահատականները ({displayedRatings.length})
          </div>
          
          <div className="space-y-3">
            {displayedRatings.map((rating) => (
              <div key={rating._id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <StarRating rating={rating.rating} size="sm" readonly={true} />
                    <span className="text-sm font-medium text-gray-900">
                      {rating.rating}/5
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(rating.createdAt)}
                  </div>
                </div>
                
                {rating.comment && (
                  <p className="text-sm text-gray-700 mb-2">
                    "{rating.comment}"
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>
                    {rating.isAnonymous ? 'Անանուն օգտատեր' : rating.reviewer?.name || 'Անհայտ'}
                  </span>
                  •
                  <span>
                    {rating.reviewType === 'driver_review' ? 'Վարորդի գնահատական' : 'Ուղևորի գնահատական'}
                  </span>
                  {rating.trip && (
                    <>
                      •
                      <span>
                        {rating.trip.fromCity} → {rating.trip.toCity}
                      </span>
                    </>
                  )}
                </div>

                {/* Category ratings for detailed view */}
                {showDetailed && rating.reviewCategories && Object.keys(rating.reviewCategories).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">Մանրամասն գնահատական:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(rating.reviewCategories).map(([category, value]) => (
                        value && (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">{categoryLabels[category]}</span>
                            <div className="flex items-center gap-1">
                              <StarRating rating={value} size="sm" readonly={true} />
                              <span className="text-xs text-gray-500">{value}</span>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Show More/Less Button */}
          {ratings.length > limit && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
            >
              {showAll ? `Ցուցադրել ավելի քիչ` : `Ցուցադրել բոլոր գնահատականները (${ratings.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
