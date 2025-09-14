'use client'

import { useState, useEffect } from 'react'
import RatingDisplay from './rating-display'
import RatingModal from './rating-modal'

export default function DriverProfileModal({ 
  driverId, 
  driverName, 
  driverInfo,
  tripId,
  tripDate,
  isOpen, 
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('ratings')
  const [ratingModalOpen, setRatingModalOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const openRatingModal = () => {
    setRatingModalOpen(true)
  }

  const closeRatingModal = () => {
    setRatingModalOpen(false)
  }

  const handleRatingSubmitted = () => {
    closeRatingModal()
    // Optionally refresh the ratings display
    window.location.reload() // Simple way to refresh ratings
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mr-4">
              {driverInfo?.avatar?.asset?.url ? (
                <img
                  src={driverInfo.avatar.asset.url}
                  alt={driverName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-300"
                />
              ) : (
                <span className="text-white text-xl font-bold">
                  {driverName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{driverName}</h2>
              <p className="text-blue-100">Վարորդ</p>
              {driverInfo?.company && (
                <p className="text-blue-200 text-sm">{driverInfo.company}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors p-2 rounded-md hover:bg-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('ratings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'ratings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Գնահատականներ
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Տեղեկություններ
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'ratings' ? (
            <div className="p-6">
              <RatingDisplay 
                userId={driverId} 
                userType="driver"
                showDetailed={true}
                limit={20}
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-6">
                {/* Vehicle Information */}
                {driverInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Մեքենայի տեղեկություններ
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {driverInfo.carModel && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Մեքենայի մոդել:</span>
                          <span className="font-medium">{driverInfo.carModel}</span>
                        </div>
                      )}
                      {driverInfo.carColor && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Գույն:</span>
                          <span className="font-medium">{driverInfo.carColor}</span>
                        </div>
                      )}
                      {driverInfo.plateNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Պետհամար:</span>
                          <span className="font-medium">{driverInfo.plateNumber}</span>
                        </div>
                      )}
                      {driverInfo.company && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ընկերություն:</span>
                          <span className="font-medium">{driverInfo.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Car Images */}
                {driverInfo?.carImages && driverInfo.carImages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Մեքենայի նկարներ
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {driverInfo.carImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.asset?.url}
                            alt={`${driverInfo.carModel} photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Լրացուցիչ տեղեկություններ
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>Անդամ է մեր հարթակում</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Փակել
            </button>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {ratingModalOpen && tripId && (
        <RatingModal
          tripId={tripId}
          otherUserId={driverId}
          otherUserName={driverName}
          otherUserType="driver"
          tripDate={tripDate}
          isOpen={ratingModalOpen}
          onClose={closeRatingModal}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  )
}
