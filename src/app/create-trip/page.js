'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'

export default function CreateTrip() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    fromCity: '',
    toCity: '',
    departureDate: '',
    departureTime: '',
    totalSeats: 1,
    pricePerSeat: '',
    currency: 'USD',
    description: '',
    stops: ['']
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not authenticated or not a driver
  if (status === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl">Բեռնում է...</div>
        </div>
      </Layout>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  if (session.user.userType !== 'driver') {
    router.push('/trips')
    return null
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleStopChange = (index, value) => {
    const newStops = [...formData.stops]
    newStops[index] = value
    setFormData({ ...formData, stops: newStops })
  }

  const addStop = () => {
    setFormData({ ...formData, stops: [...formData.stops, ''] })
  }

  const removeStop = (index) => {
    const newStops = formData.stops.filter((_, i) => i !== index)
    setFormData({ ...formData, stops: newStops })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Filter out empty stops
      const cleanedStops = formData.stops.filter(stop => stop.trim() !== '')
      
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          stops: cleanedStops,
          availableSeats: parseInt(formData.totalSeats),
          totalSeats: parseInt(formData.totalSeats),
          pricePerSeat: parseFloat(formData.pricePerSeat)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/my-trips')
      } else {
        setError(data.error || 'Ինչ-որ բան սխալ է գնացել')
      }
    } catch (error) {
      setError('Կապի խնդիր: Խնդրում ենք նորից փորձել:')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Ստեղծել նոր ճանապարհորդություն</h1>
              <p className="text-gray-600">Հրապարակիր ձեր նախատեսված ճանապարհը և կապվիր ճանապարհ փնտրող ուղևորների հետ:</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Route Information */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Երթուղու տեղեկություններ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fromCity" className="block text-sm font-medium text-gray-700 mb-2">
                      Ելակետային քաղաք *
                    </label>
                    <input
                      id="fromCity"
                      name="fromCity"
                      type="text"
                      required
                      value={formData.fromCity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="օր․ Երևան"
                    />
                  </div>
                  <div>
                    <label htmlFor="toCity" className="block text-sm font-medium text-gray-700 mb-2">
                      Նպատակային քաղաք *
                    </label>
                    <input
                      id="toCity"
                      name="toCity"
                      type="text"
                      required
                      value={formData.toCity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="օր․ Վանաձոր"
                    />
                  </div>
                </div>

                {/* Intermediate Stops */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ենթակա կանգառներ (ոչ պարտադիր)
                    </label>
                    <button
                      type="button"
                      onClick={addStop}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Ավելացնել կանգառ
                    </button>
                  </div>
                  {formData.stops.map((stop, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={stop}
                        onChange={(e) => handleStopChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="օր․ Գյումրի"
                      />
                      {formData.stops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          className="text-red-600 hover:text-red-700 px-2 py-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ժամանակացույց</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Ելքի ամսաթիվ *
                    </label>
                    <input
                      id="departureDate"
                      name="departureDate"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.departureDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Ելքի ժամ *
                    </label>
                    <input
                      id="departureTime"
                      name="departureTime"
                      type="time"
                      required
                      value={formData.departureTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Capacity and Pricing */}
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Տեղերի քանակ և գնակալում</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="totalSeats" className="block text-sm font-medium text-gray-700 mb-2">
                      Հասանելի տեղեր *
                    </label>
                    <select
                      id="totalSeats"
                      name="totalSeats"
                      required
                      value={formData.totalSeats}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} տեղ</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pricePerSeat" className="block text-sm font-medium text-gray-700 mb-2">
                      Գինը մեկ տեղի համար *
                    </label>
                    <input
                      id="pricePerSeat"
                      name="pricePerSeat"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.pricePerSeat}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50.00"
                    />
                  </div>
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                      Արժույթ
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="AMD">AMD (֏)</option>
                      <option value="RUB">RUB (₽)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Լրացուցիչ մանրամասներ</h2>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Ճանապարհորդության նկարագրություն (ոչ պարտադիր)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ավելացնել լրացուցիչ տեղեկություններ ճանապարհորդության, մեքենայի հարմարությունների, վերցնելու/թողնելու նախապատվությունների մասին:"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Չեղարկել
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Ստեղծում է ճանապարհորդությունը...' : 'Ստեղծել ճանապարհորդությունը'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
