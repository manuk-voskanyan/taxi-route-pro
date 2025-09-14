'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import RatingForm from './rating-form'
import Swal from 'sweetalert2'

export default function RatingModal({ 
  tripId, 
  otherUserId, 
  otherUserName, 
  otherUserType,
  tripDate,
  isOpen, 
  onClose, 
  onRatingSubmitted 
}) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  if (!isOpen) return null

  const handleRatingSubmit = async (ratingData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating')
      }

      setSubmitted(true)
      
      // Store the success message to display it
      setSuccessMessage(data.message || 'Rating submitted successfully')
      
      // Show success message briefly, then close
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        if (onRatingSubmitted) {
          onRatingSubmitted(data.data)
        }
      }, 2000)

    } catch (error) {
      console.error('Error submitting rating:', error)
      Swal.fire({
        title: 'Սխալ',
        text: `Սխալ: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Հասկանալի',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setSubmitted(false)
    }
  }

  // Determine review type based on user types - default to rating drivers
  let reviewType = 'driver_review' // Default to driver review (most common case)
  
  // If the other user is not a driver, then it's a passenger review  
  if (otherUserType === 'passenger') {
    reviewType = 'passenger_review'
  } else {
    // Default case: we're reviewing a driver
    reviewType = 'driver_review'
  }



  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {successMessage.includes('updated') ? 'Գնահատականը թարմացվեց' : 'Գնահատականը ուղարկվեց'}
          </h3>
          <p className="text-gray-600 text-sm">Շնորհակալություն ձեր գնահատականի համար</p>
        </div>
      </div>
    )
  }

  return (
    <RatingForm
      tripId={tripId}
      revieweeId={otherUserId}
      revieweeName={otherUserName}
      reviewType={reviewType}
      tripDate={tripDate}
      onSubmit={handleRatingSubmit}
      onCancel={handleClose}
      isSubmitting={isSubmitting}
    />
  )
}
