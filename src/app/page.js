'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'

// FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRegisteredUsers()
  }, [])

  const fetchRegisteredUsers = async () => {
    try {
      const response = await fetch('/api/users?limit=8') // Last 8 registered users
      const data = await response.json()
      if (response.ok) {
        setRegisteredUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching registered users:', error)
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
      
      {/* Registered Users Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Մեր նոր համայնքի անդամներ
            </h2>
            <p className="text-lg text-gray-600">
              Ծանոթացիր մեր վերջին գրանցված օգտագործողներին
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6 lg:gap-8 max-w-4xl">
                {registeredUsers.map((user) => (
                <div key={user._id} className="flex flex-col items-center">
                  <div className="relative mb-3">
                    {(user.avatar?.asset?.url || user.avatar?.url) ? (
                      <img
                        src={user.avatar?.asset?.url || user.avatar?.url}
                        alt={user.name}
                        className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      />
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl lg:text-2xl border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    {/* User Type Badge */}
                    <div className="absolute -bottom-1 -right-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        user.userType === 'driver' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.userType === 'driver' ? '🚗' : '👤'}
                      </span>
                    </div>
                  </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 text-center truncate max-w-full">
                      {user.name}
                    </h3>
                  </div>
                ))}
                
                {registeredUsers.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>Գրանցված օգտատերեր չեն գտնվել</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Հաճախակի տրվող հարցեր
            </h2>
            <p className="text-lg text-gray-600">
              Գտիր պատասխանները ամենահաճախ տրվող հարցերի
            </p>
          </div>

          <div className="space-y-4">
            <FAQItem 
              question="Ինչպե՞ս միանալ TaxiRoute Pro-ին:"
              answer="Կարող եք գրանցվել որպես վարորդ կամ ուղևոր: Պարզապես սեղմեք 'Գրանցվել' կոճակը և լրացրեք անհրաժեշտ տեղեկությունները: Գրանցումը ամբողջությամբ անվճար է:"
            />
            
            <FAQItem 
              question="Որքա՞ն է արժում TaxiRoute Pro-ի օգտագործումը:"
              answer="Ծառայությունը անվճար է ուղևորների համար: Վարորդներն ունեն փոքր կանխավճար յուրաքանչյուր հաջող ճանապարհորդության համար, բայց գրանցումը և հավելվածի օգտագործումը անվճար են:"
            />
            
            <FAQItem 
              question="Երբ կարող եմ սկսել վարել TaxiRoute Pro-ով:"
              answer="Հնարավոր է սկսել վարել անմիջապես գրանցումից հետո: Պարզապես ավելացրեք ձեր մեքենայի տեղեկությունները, հրապարակեք ճանապարհորդություն և սպասեք ուղևորների հարցումներին:"
            />
            
            <FAQItem 
              question="Կա՞ն TaxiRoute Pro վարորդներ իմ մոտակայքում:"
              answer="TaxiRoute Pro-ն գործում է Հայաստանի գլխավոր քաղաքներում և շրջաններում: Օգտագործեք մեր փնտրման գործիքը տեսնելու համար ձեր տարածքում առկա ճանապարհորդությունները:"
            />
            
            <FAQItem 
              question="Ներառված է՞ բենզինը:"
              answer="Բենզինի հարցը որոշվում է յուրաքանչյուր վարորդի կողմից: Որոշ վարորդներ կարող են ներառել բենզինը գնի մեջ, մյուսները՝ առանձին վճարում պահանջել: Մանրամասները նշված են յուրաքանչյուր ճանապարհորդության նկարագրության մեջ:"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-blue-600 text-white rounded-lg p-2 mr-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">TaxiRoute Pro</span>
            </div>
            
            {/* Footer Links */}
            <div className="flex justify-center space-x-8 mb-6">
              <Link 
                href="/privacy-policy" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Գաղտնիության քաղաքականություն
              </Link>
              <Link 
                href="/help" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Օգնություն
              </Link>
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
