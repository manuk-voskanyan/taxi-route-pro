'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'

export default function Home() {
  const { data: session, status } = useSession()
  const [recentTrips, setRecentTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentTrips()
  }, [])

  const fetchRecentTrips = async () => {
    try {
      const response = await fetch('/api/trips?limit=3')
      const data = await response.json()
      if (response.ok) {
        setRecentTrips(data.trips || [])
      }
    } catch (error) {
      console.error('Error fetching recent trips:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Խնայեք,</span>
                    <span className="block text-blue-600">երբ վարում եք</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Գրանցեք վարորդի պրոֆիլ, վերցրեք ուղևորներ և խնայեք բենզինի վրա: Վերցրեք առաջին ուղևորին մի քանի րոպեում: Պատրա՞ստ եք մեկնել:
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      {status === 'authenticated' && session?.user?.userType === 'driver' ? (
                        <Link
                          href="/create-trip"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                        >
                          Հրապարակել ճանապարհորդություն
                        </Link>
                      ) : (
                        <Link
                          href="/auth/signup"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                        >
                          Հրապարակել ճանապարհորդություն
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 flex justify-center">
                  <div className="relative w-full max-w-lg">
                    <img
                      className="w-full h-auto"
                      src="/driver.svg"
                      alt="Վարորդ և ուղևորներ"
                    />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Recent Trips Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Մեր հանրաճանաչ ճանապարհակիցների ուղղությունները
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {recentTrips.map((trip, index) => (
                <div key={trip._id} className="relative bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                  {/* Action Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Նոր
                    </span>
                  </div>
                  
                  {/* Background Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
                    {/* City illustration overlay */}
                    <div className="absolute inset-0 bg-[#165FF2] bg-opacity-20"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">{trip.fromCity}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">{trip.toCity}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        Սկսած {trip.pricePerSeat}
                        <span className="text-sm text-gray-500 ml-1">{trip.currency || 'AMD'}</span>
                      </div>
                      <Link
                        href="/trips"
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                    
                    {/* Trip Info */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Ամսաթիվ:</span>
                        <span className="font-medium">{new Date(trip.departureDate).toLocaleDateString('hy-AM')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ժամ:</span>
                        <span className="font-medium">{trip.departureTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Տեղեր:</span>
                        <span className="font-medium">{trip.availableSeats}/{trip.totalSeats}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentTrips.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                  </svg>
                  <p>Երևում է, թե դեռ ճանապարհորդություններ չկան:</p>
                </div>
              )}
            </div>
          )}
          
          {/* View All Button */}
          {recentTrips.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/trips"
                className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Դիտել բոլոր ճանապարհորդությունները
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Միացիր մեր աճող համայնքին
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
              <div className="text-gray-400">Ակտիվ օգտագործողներ</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
              <div className="text-gray-400">Հաջող ճանապարհորդություններ</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">50+</div>
              <div className="text-gray-400">Կապակցված քաղաքներ</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">4.8★</div>
              <div className="text-gray-400">Միջին գնահատական</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Պատրա՞ստ եք սկսել ձեր ճանապարհորդությունը
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Միացիր հազարավոր վարորդների և ուղևորների, ովքեր վստահում են TaxiRoute Pro-ին իրենց քաղաքարի ճանապարհորդությունների համար։
          </p>
          {status !== 'authenticated' ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Գրանցվել հիմա
              </Link>
              <Link
                href="/trips"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Դիտել ճանապարհորդություններ
              </Link>
            </div>
          ) : (
            <Link
              href={session?.user?.userType === 'driver' ? '/create-trip' : '/trips'}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
            >
              {session?.user?.userType === 'driver' ? 'Ստեղծել ձեր առաջին ճանապարհորդությունը' : 'Գտնել ձեր հաջորդ ճանապարհը'}
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-blue-600 text-white rounded-lg p-2 mr-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">TaxiRoute Pro</span>
            </div>
            <p className="text-gray-500">
              © 2024 TaxiRoute Pro. Անվտանգ և արդյունավետ կապ ճանապարհորդների միջև քաղաքների միջև։
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  )
}
