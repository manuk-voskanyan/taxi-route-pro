'use client'

import { useState } from 'react'
import StarRating from './star-rating'

export default function RatingForm({ 
  tripId, 
  revieweeId, 
  revieweeName, 
  reviewType, 
  tripDate, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  existingRating = null
}) {
  const [rating, setRating] = useState(existingRating?.rating || 5)
  const [comment, setComment] = useState(existingRating?.comment || '')
  const [isAnonymous, setIsAnonymous] = useState(existingRating?.isAnonymous || false)
  const [isPublic, setIsPublic] = useState(existingRating?.isPublic !== undefined ? existingRating.isPublic : true)
  const [categoryRatings, setCategoryRatings] = useState({
    punctuality: existingRating?.reviewCategories?.punctuality || 5,
    communication: existingRating?.reviewCategories?.communication || 5,
    cleanliness: reviewType === 'driver_review' ? (existingRating?.reviewCategories?.cleanliness || 5) : undefined,
    drivingSkill: reviewType === 'driver_review' ? (existingRating?.reviewCategories?.drivingSkill || 5) : undefined,
    politeness: existingRating?.reviewCategories?.politeness || 5,
    reliability: existingRating?.reviewCategories?.reliability || 5
  })

  const isDriverReview = reviewType === 'driver_review'
  const userRole = isDriverReview ? 'վարորդի' : 'ուղևորի'

  const categoryLabels = {
    punctuality: 'Ճշգրտություն',
    communication: 'Հաղորդակցություն', 
    cleanliness: 'Մաքրություն',
    drivingSkill: 'Վարչական հմտություն',
    politeness: 'Բարեկրթություն',
    reliability: 'Հուսալիություն'
  }

  const handleCategoryRatingChange = (category, newRating) => {
    setCategoryRatings(prev => ({
      ...prev,
      [category]: newRating
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Remove undefined values from category ratings
    const cleanCategoryRatings = {}
    Object.entries(categoryRatings).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanCategoryRatings[key] = value
      }
    })

    // Only validate essential fields for the API to work
    if (!tripId || !revieweeId || !reviewType) {
      alert('Տեխնիկական սխալ: Խնդրում ենք նորից փորձել')
      return
    }

    // Use fallback values for optional fields
    const finalTripDate = tripDate || new Date().toISOString().split('T')[0]
    const finalRating = rating || 5 // Default to 5 stars if not set

    const ratingData = {
      tripId,
      revieweeId,
      rating: finalRating,
      reviewType,
      comment: comment.trim(),
      reviewCategories: cleanCategoryRatings,
      isAnonymous,
      isPublic,
      tripDate: finalTripDate
    }

    await onSubmit(ratingData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Գնահատել {userRole}ն
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">{isDriverReview ? 'Վարորդ' : 'Ուղևոր'}:</div>
            <div className="font-medium text-gray-900">{revieweeName}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ընդհանուր գնահատական
              </label>
              <div className="flex items-center gap-3">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="lg"
                />
                <span className="text-lg font-medium text-gray-900">{rating}/5</span>
              </div>
            </div>

            {/* Category Ratings */}
            <div>
              <div className="space-y-3">
                {Object.entries(categoryRatings).map(([category, value]) => {
                  if (value === undefined) return null
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 w-32">
                        {categoryLabels[category]}
                      </span>
                      <div className="flex items-center gap-2">
                        <StarRating
                          rating={value}
                          onRatingChange={(newRating) => handleCategoryRatingChange(category, newRating)}
                          size="sm"
                        />
                        <span className="text-sm text-gray-500 w-8">{value}/5</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Մեկնաբանություն (ոչ պարտադիր)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder={`Կիսվեք ձեր կարծիքով ${userRole} մասին...`}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {comment.length}/500 նիշ
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                  Հրապարակել գնահատականը (այլ օգտատերերը կարող են տեսնել)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-700">
                  Անանուն գնահատական (ձեր անունը չի ցուցադրվի)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Չեղարկել
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ուղարկվում է...
                  </>
                ) : (
                  'Ուղարկել գնահատականը'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
