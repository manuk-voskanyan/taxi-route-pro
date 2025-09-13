'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Layout } from '@/components/layout'

export default function MyTrips() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated or not a driver
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    if (session.user.userType !== 'driver') {
      router.push('/trips')
      return
    }
    fetchMyTrips()
  }, [session, status])

  const fetchMyTrips = async () => {
    try {
      const response = await fetch('/api/my-trips')
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('hy-AM', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('hy-AM', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'full': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Ակտիվ'
      case 'full': return 'Լրիվ'
      case 'completed': return 'Ավարտված'
      case 'cancelled': return 'Չեղարկված'
      default: return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl">Բեռնում է ձեր ճանապարհորդությունները...</div>
        </div>
      </Layout>
    )
  }

  if (!session || session.user.userType !== 'driver') {
    return null
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Իմ ճանապարհորդությունները</h1>
              <p className="text-gray-600">Կառավարիր ձեր ստեղծված ճանապարհորդությունները</p>
            </div>
            <Link
              href="/create-trip"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Նոր ճանապարհորդություն
            </Link>
          </div>

          {/* Trip Cards */}
          {trips.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Դեռ ճանապարհորդություններ չեք ստեղծել</h3>
              <p className="text-gray-600 mb-6">
                Ստեղծեք ձեր առաջին ճանապարհորդությունը և սկսեք կապվել ուղևորների հետ:
              </p>
              <Link 
                href="/create-trip"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Ստեղծել առաջին ճանապարհորդությունը
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {trips.map((trip) => (
                <div key={trip._id} className="bg-white rounded-lg shadow-md">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* Route */}
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                            <div className="text-xl font-semibold text-gray-900">
                              {trip.fromCity}
                            </div>
                          </div>
                          <div className="mx-4 flex-1 relative">
                            <svg className="w-full h-4" viewBox="0 0 200 16" preserveAspectRatio="none">
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

                        {/* Trip Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Ամսաթիվ</div>
                            <div className="font-medium">{formatDate(trip.departureDate)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Ժամ</div>
                            <div className="font-medium">{formatTime(trip.departureTime)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Տեղեր</div>
                            <div className="font-medium">{trip.availableSeats}/{trip.totalSeats}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Գին</div>
                            <div className="font-medium text-blue-600">
                              {trip.currency} {trip.pricePerSeat}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Կարգավիճակ</div>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                              {getStatusText(trip.status)}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {trip.description && (
                          <div className="mt-4">
                            <div className="text-sm text-gray-500 mb-1">Նկարագրություն:</div>
                            <div className="text-gray-700 text-sm">{trip.description}</div>
                          </div>
                        )}

                        {/* Stops */}
                        {trip.stops && trip.stops.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm text-gray-500 mb-1">Կանգառներ:</div>
                            <div className="text-sm text-gray-700">
                              {trip.stops.join(' • ')}
                            </div>
                          </div>
                        )}

                        {/* Passengers */}
                        {trip.passengers && trip.passengers.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm text-gray-500 mb-2">Ամրագրված ուղևորներ:</div>
                            <div className="space-y-2">
                              {trip.passengers.map((passenger, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                  <div>
                                    <div className="font-medium">{passenger.passenger?.name || 'Անհայտ ուղևոր'}</div>
                                    <div className="text-sm text-gray-500">
                                      {passenger.seatsBooked} տեղ • Ամրագրված՝ {formatDate(passenger.bookingDate)}
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    passenger.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    passenger.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {passenger.status === 'confirmed' ? 'Հաստատված' :
                                     passenger.status === 'pending' ? 'Սպասում է' : 'Չեղարկված'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ml-6 flex flex-col space-y-2">
                        <button
                          onClick={() => {
                            // TODO: Implement trip editing
                            alert('Ճանապարհորդության խմբագրումը շուտով!')
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          Խմբագրել
                        </button>
                        {trip.status === 'active' && (
                          <button
                            onClick={() => {
                              // TODO: Implement trip cancellation
                              if (confirm('Համոզվա՞ծ եք, որ ցանկանում եք չեղարկել այս ճանապարհորդությունը:')) {
                                alert('Չեղարկման գործառույթը շուտով!')
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                          >
                            Չեղարկել
                          </button>
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
    </Layout>
  )
}
