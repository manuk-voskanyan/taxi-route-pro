'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export function Navigation() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="bg-blue-600 text-white rounded-lg p-2 mr-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">TaxiRoute Pro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/trips" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Ճանապարհներ
            </Link>
            
            {status === 'authenticated' ? (
              <>
                {session.user.userType === 'driver' && (
                  <>
                    <Link href="/create-trip" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Նոր ճանապարհ
                    </Link>
                    <Link href="/my-trips" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Իմ ճանապարհները
                    </Link>
                  </>
                )}
                <Link href="/messages" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Նամակներ
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Պրոֆիլ
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <span className="text-gray-700 text-sm">
                      Բարև, {session.user.name}
                    </span>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {session.user.userType === 'driver' ? 'Վարորդ' : 'Ուղևոր'}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Ելք
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Մուտք
                </Link>
                <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  Գրանցում
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              <Link href="/trips" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Ճանապարհներ
              </Link>
              
              {status === 'authenticated' ? (
                <>
                  {session.user.userType === 'driver' && (
                    <>
                      <Link href="/create-trip" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                        Նոր ճանապարհ
                      </Link>
                      <Link href="/my-trips" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                        Իմ ճանապարհները
                      </Link>
                    </>
                  )}
                  <Link href="/messages" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                    Նամակներ
                  </Link>
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                    Պրոֆիլ
                  </Link>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="px-3 py-2 flex items-center space-x-3">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-700 text-sm font-medium">Բարև, {session.user.name}</p>
                        <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block">
                          {session.user.userType === 'driver' ? 'Վարորդ' : 'Ուղևոր'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-base font-medium"
                    >
                      Ելք
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                    Մուտք
                  </Link>
                  <Link href="/auth/signup" className="bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium text-center">
                    Գրանցում
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
