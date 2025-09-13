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
  const [editingTrip, setEditingTrip] = useState(null)
  const [editFormData, setEditFormData] = useState({
    fromCity: '',
    toCity: '',
    departureDate: '',
    departureTime: '',
    totalSeats: '',
    pricePerSeat: '',
    currency: 'USD',
    description: '',
    stops: []
  })

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

  const openEditModal = (trip) => {
    setEditingTrip(trip)
    setEditFormData({
      fromCity: trip.fromCity,
      toCity: trip.toCity,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      totalSeats: trip.totalSeats.toString(),
      pricePerSeat: trip.pricePerSeat.toString(),
      currency: trip.currency || 'USD',
      description: trip.description || '',
      stops: trip.stops || []
    })
  }

  const closeEditModal = () => {
    setEditingTrip(null)
    setEditFormData({
      fromCity: '',
      toCity: '',
      departureDate: '',
      departureTime: '',
      totalSeats: '',
      pricePerSeat: '',
      currency: 'USD',
      description: '',
      stops: []
    })
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditStopChange = (index, value) => {
    setEditFormData(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) => i === index ? value : stop)
    }))
  }

  const addEditStop = () => {
    setEditFormData(prev => ({
      ...prev,
      stops: [...prev.stops, '']
    }))
  }

  const removeEditStop = (index) => {
    setEditFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/trips/${editingTrip._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editFormData),
      })

      if (response.ok) {
        const result = await response.json()
        // Update the trip in the local state
        setTrips(prev => prev.map(trip => 
          trip._id === editingTrip._id ? result.trip : trip
        ))
        closeEditModal()
        alert('Ճանապարհորդությունը հաջողությամբ թարմացված է!')
      } else {
        const error = await response.json()
        alert(`Սխալ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating trip:', error)
      alert('Ցանցային սխալ: ' + error.message)
    }
  }

  const cancelTrip = async (tripId) => {
    if (!confirm('Համոզվա՞ծ եք, որ ցանկանում եք չեղարկել այս ճանապարհորդությունը:')) {
      return
    }

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        // Update the trip status in local state
        setTrips(prev => prev.map(trip => 
          trip._id === tripId ? { ...trip, status: 'cancelled' } : trip
        ))
        alert('Ճանապարհորդությունը չեղարկվել է!')
      } else {
        const error = await response.json()
        alert(`Սխալ: ${error.error}`)
      }
    } catch (error) {
      console.error('Error cancelling trip:', error)
      alert('Ցանցային սխալ: ' + error.message)
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
                           onClick={() => openEditModal(trip)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          Խմբագրել
                        </button>
                        {trip.status === 'active' && (
                          <button
                          onClick={() => cancelTrip(trip._id)}
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

      {/* Edit Modal */}
      {editingTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Խմբագրել ճանապարհորդությունը</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Route Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Մեկնարկային քաղաք
                    </label>
                    <input
                      type="text"
                      name="fromCity"
                      value={editFormData.fromCity}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Նպատակակետ
                    </label>
                    <input
                      type="text"
                      name="toCity"
                      value={editFormData.toCity}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Մեկնարկի ամսաթիվ
                    </label>
                    <input
                      type="date"
                      name="departureDate"
                      value={editFormData.departureDate}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Մեկնարկի ժամ
                    </label>
                    <input
                      type="time"
                      name="departureTime"
                      value={editFormData.departureTime}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Seats and Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Տեղերի քանակ
                    </label>
                    <input
                      type="number"
                      name="totalSeats"
                      value={editFormData.totalSeats}
                      onChange={handleEditInputChange}
                      min="1"
                      max="8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Մեկ տեղի գին
                    </label>
                    <input
                      type="number"
                      name="pricePerSeat"
                      value={editFormData.pricePerSeat}
                      onChange={handleEditInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Արժույթ
                    </label>
                    <select
                      name="currency"
                      value={editFormData.currency}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="AMD">AMD</option>
                      <option value="RUB">RUB</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Նկարագրություն
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Լրացուցիչ ինֆորմացիա..."
                  />
                </div>

                {/* Stops */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Միջանկյալ կանգառներ
                    </label>
                    <button
                      type="button"
                      onClick={addEditStop}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Ավելացնել կանգառ
                    </button>
                  </div>
                  {editFormData.stops.map((stop, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={stop}
                        onChange={(e) => handleEditStopChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Կանգառ ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeEditStop(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Չեղարկել
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Պահպանել
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
