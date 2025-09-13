'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Layout } from '@/components/layout'

export default function Trips() {
  const { data: session } = useSession()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState({
    fromCity: '',
    toCity: '',
    departureDate: ''
  })
  const [filteredTrips, setFilteredTrips] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentTripImages, setCurrentTripImages] = useState([])

  useEffect(() => {
    fetchTrips()
  }, [])

  useEffect(() => {
    // Filter trips based on search criteria
    let filtered = trips
    
    if (searchFilters.fromCity) {
      filtered = filtered.filter(trip => 
        trip.fromCity.toLowerCase().includes(searchFilters.fromCity.toLowerCase())
      )
    }
    
    if (searchFilters.toCity) {
      filtered = filtered.filter(trip => 
        trip.toCity.toLowerCase().includes(searchFilters.toCity.toLowerCase())
      )
    }
    
    if (searchFilters.departureDate) {
      filtered = filtered.filter(trip => trip.departureDate === searchFilters.departureDate)
    }
    
    setFilteredTrips(filtered)
  }, [trips, searchFilters])

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips')
      const data = await response.json()
      if (response.ok) {
        setTrips(data.trips || [])
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchFilters({
      ...searchFilters,
      [e.target.name]: e.target.value
    })
  }

  const clearFilters = () => {
    setSearchFilters({
      fromCity: '',
      toCity: '',
      departureDate: ''
    })
  }

  const openImageModal = (imageUrl, carModel) => {
    setSelectedImage({ url: imageUrl, carModel })
    setImageModalOpen(true)
  }

  const closeImageModal = () => {
    setImageModalOpen(false)
    setSelectedImage(null)
  }

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && imageModalOpen) {
        closeImageModal()
      }
    }

    if (imageModalOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [imageModalOpen])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl">Բեռնում է ճանապարհորդությունները...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Գտիր քո կատարյալ ճանապարհորդությունը</h1>
            <p className="text-gray-600">Դիտիր հասանելի քաղաքարի տաքսի ճանապարհորդությունները և ամրագրիր քո տեղը</p>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Որտեղից</label>
                <input
                  type="text"
                  name="fromCity"
                  value={searchFilters.fromCity}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ելակետային քաղաք"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ուր</label>
                <input
                  type="text"
                  name="toCity"
                  value={searchFilters.toCity}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Նպատակային քաղաք"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ամսաթիվ</label>
                <input
                  type="date"
                  name="departureDate"
                  value={searchFilters.departureDate}
                  onChange={handleSearchChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Մաքրել ֆիլտրերը
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-gray-600">
              Գտնվել է {filteredTrips.length} ճանապարհորդություն
            </p>
          </div>

          {/* Trip Cards */}
          {filteredTrips.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Ճանապարհորդություններ չեն գտնվել</h3>
              <p className="text-gray-600 mb-6">
                {trips.length === 0 
                  ? "Դեռ ճանապարհորդություններ չեն հրապարակվել: Ստուգիր ավելի ուշ կամ ստեղծիր քո սեփական ճանապարհորդությունը:"
                  : "Ոչ մի ճանապարհորդություն չի համապատասխանում ձեր փնտրման չափանիշներին: Փորձիր ճշգրտել ֆիլտրերը:"
                }
              </p>
              {session?.user?.userType === 'driver' && (
                <Link 
                  href="/create-trip"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Ստեղծել ձեր առաջին ճանապարհորդությունը
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrips.map((trip) => (
                <div key={trip._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Route */}
                        <div className="flex items-center mb-4">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                            <div className="text-xl font-semibold text-gray-900">
                              {trip.fromCity}
                            </div>
                          </div>
                          <div className="mx-4 flex-1 relative">
                            <svg className="w-full h-4" viewBox="0 0 200 16" preserveAspectRatio="none">
                              {/* Curved connecting lines matching reference image */}
                              <path 
                                d="M5,8 Q50,4 100,8 T195,8" 
                                stroke="#d1d5db" 
                                strokeWidth="1" 
                                fill="none"
                              />
                              <path 
                                d="M5,6 Q50,2 100,6 T195,6" 
                                stroke="#e5e7eb" 
                                strokeWidth="0.8" 
                                fill="none"
                              />
                              <path 
                                d="M5,10 Q50,6 100,10 T195,10" 
                                stroke="#e5e7eb" 
                                strokeWidth="0.8" 
                                fill="none"
                              />
                            </svg>
                          </div>
                          <div className="flex items-center">
                            <div className="text-xl font-semibold text-gray-900">
                              {trip.toCity}
                            </div>
                            <div className="ml-3">
                              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Trip Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-500">Ամսաթիվ</div>
                            <div className="font-medium">{formatDate(trip.departureDate)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Ժամ</div>
                            <div className="font-medium">{formatTime(trip.departureTime)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Հասանելի տեղեր</div>
                            <div className="font-medium">{trip.availableSeats}/{trip.totalSeats}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Գինը մեկ տեղի համար</div>
                            <div className="font-medium text-blue-600">
                              {trip.currency} {trip.pricePerSeat}
                            </div>
                          </div>
                        </div>

                        {/* Driver Info */}
                        <div className="flex items-center mb-4">
                          <div className="mr-3">
                            {trip.driver.avatar?.asset?.url ? (
                              <img
                                src={trip.driver.avatar.asset.url}
                                alt={trip.driver.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="bg-gray-200 rounded-full p-2">
                                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-gray-900">{trip.driver.name}</div>
                              {trip.driver.driverInfo?.company && (
                                <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-medium transform -rotate-1">
                                  Company
                                </div>
                              )}
                            </div>
                            {trip.driver.driverInfo && (
                              <div className="text-sm text-gray-500">
                                {trip.driver.driverInfo.company && (
                                  <div className="text-sm font-medium text-gray-700 mb-1">
                                    {trip.driver.driverInfo.company}
                                  </div>
                                )}
                                {trip.driver.driverInfo.carModel} {trip.driver.driverInfo.carColor && `• ${trip.driver.driverInfo.carColor}`}
                                {trip.driver.driverInfo.plateNumber && ` • ${trip.driver.driverInfo.plateNumber}`}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Car Images */}
                        {trip.driver.driverInfo?.carImages && trip.driver.driverInfo.carImages.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm text-gray-500 mb-2">Մեքենայի լուսանկարներ:</div>
                            <div className="flex space-x-2 overflow-x-auto">
                              {trip.driver.driverInfo.carImages.slice(0, 3).map((image, index) => (
                                <div key={index} className="flex-shrink-0">
                                  <img
                                    src={image.asset?.url}
                                    alt={`${trip.driver.driverInfo.carModel} photo ${index + 1}`}
                                    className="w-20 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                    onClick={() => openImageModal(image.asset?.url, trip.driver.driverInfo.carModel)}
                                  />
                                </div>
                              ))}
                              {trip.driver.driverInfo.carImages.length > 3 && (
                                <div 
                                  className="flex-shrink-0 w-20 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                                  onClick={() => openImageModal(trip.driver.driverInfo.carImages[3]?.asset?.url, trip.driver.driverInfo.carModel)}
                                >
                                  +{trip.driver.driverInfo.carImages.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stops */}
                        {trip.stops && trip.stops.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm text-gray-500 mb-1">Կանգառներ ճանապարհին:</div>
                            <div className="text-sm text-gray-700">
                              {trip.stops.join(' • ')}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {trip.description && (
                          <div className="text-gray-700 text-sm mb-4">
                            {trip.description}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="ml-6">
                        {session ? (
                          trip.availableSeats > 0 ? (
                            <button
                              onClick={() => {
                                // TODO: Open messaging modal or redirect to contact page
                                alert('Հաղորդագրների գործառույթը շուտով! Հիմա, խնդրում ենք անմիջապես կապվել վարորդի հետ:')
                              }}
                              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                              Կապվել վարորդի հետ
                            </button>
                          ) : (
                            <div className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed">
                              Լրիվ ամրագրված
                            </div>
                          )
                        ) : (
                          <Link
                            href="/auth/signin"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
                          >
                            Մտնել ամրագրելու համար
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeImageModal()
            }
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image */}
            <img
              src={selectedImage.url}
              alt={`${selectedImage.carModel} - Full size`}
              className="w-full h-full object-contain rounded-lg"
            />
            
            {/* Image info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">{selectedImage.carModel}</p>
              <p className="text-xs text-gray-300">Սեղմիր դրսում կամ ESC՝ փակելու համար</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

