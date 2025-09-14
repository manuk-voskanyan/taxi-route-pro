'use client'

import { useState } from 'react'

export default function StarRating({ 
  rating = 0, 
  onRatingChange = null, 
  size = 'md', 
  readonly = false, 
  showText = false,
  totalReviews = null 
}) {
  const [hoverRating, setHoverRating] = useState(0)
  const [tempRating, setTempRating] = useState(rating)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const handleMouseEnter = (index) => {
    if (readonly) return
    setHoverRating(index)
  }

  const handleMouseLeave = () => {
    if (readonly) return
    setHoverRating(0)
  }

  const handleClick = (index) => {
    if (readonly || !onRatingChange) return
    setTempRating(index)
    onRatingChange(index)
  }

  const displayRating = readonly ? rating : (hoverRating || tempRating)

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((index) => {
          const isFilled = index <= displayRating
          const isHalfFilled = !Number.isInteger(displayRating) && 
                              index === Math.ceil(displayRating) && 
                              readonly

          return (
            <button
              key={index}
              type="button"
              className={`${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
              } relative`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(index)}
              disabled={readonly}
            >
              {isHalfFilled ? (
                <div className="relative">
                  <svg className={`${sizes[size]} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${(displayRating % 1) * 100}%` }}
                  >
                    <svg className={`${sizes[size]} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <svg 
                  className={`${sizes[size]} ${
                    isFilled ? 'text-yellow-400' : 'text-gray-300'
                  } ${!readonly && hoverRating >= index ? 'text-yellow-500' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
      
      {showText && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span className="font-medium">{rating.toFixed(1)}</span>
          {totalReviews !== null && (
            <span>({totalReviews} գնահատում{totalReviews !== 1 ? 'ներ' : ''})</span>
          )}
        </div>
      )}
    </div>
  )
}
