'use client'

import { Layout } from '@/components/layout'
import { useState } from 'react'
import Link from 'next/link'

// Help Section Component
function HelpSection({ title, children, isOpen, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
        onClick={onToggle}
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
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
          <div className="text-gray-700">{children}</div>
        </div>
      )}
    </div>
  )
}

export default function Help() {
  const [openSections, setOpenSections] = useState({})

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Օգնություն և աջակցություն
            </h1>
            <p className="text-lg text-gray-600">
              Գտիր պատասխանները քո հարցերին կամ կապվիր մեր աջակցության թիմի հետ
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Հաճախակի հարցեր</h3>
              <p className="text-gray-600 text-sm mb-4">Գտիր պատասխանները ամենահաճախ տրվող հարցերին</p>
              <Link href="/#faq" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Դիտել հարցերը →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Էլ. նամակ</h3>
              <p className="text-gray-600 text-sm mb-4">Գրիր մեզ քո հարցերի համար</p>
              <a href="mailto:support@taxiroutepro.am" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                support@taxiroutepro.am
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Հեռախոս</h3>
              <p className="text-gray-600 text-sm mb-4">Զանգահարիր մեր աջակցության գիծ</p>
              <a href="tel:+37410123456" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                +374 10 12-34-56
              </a>
            </div>
          </div>

          {/* Help Sections */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ցանցային ուղեցույցներ</h2>
            
            <HelpSection
              title="Նոր օգտատիրոջ համար"
              isOpen={openSections.newUser}
              onToggle={() => toggleSection('newUser')}
            >
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Գրանցում և մուտք</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Սեղմեք "Գրանցվել" կոճակը</li>
                  <li>Ընտրեք ձեր օգտատիրոջ տեսակը (վարորդ կամ ուղևոր)</li>
                  <li>Լրացրեք պարտադիր դաշտերը</li>
                  <li>Հաստատեք ձեր էլ. հասցեն</li>
                  <li>Մուտք գործեք ձեր նոր հաշվով</li>
                </ol>
              </div>
            </HelpSection>

            <HelpSection
              title="Վարորդների համար"
              isOpen={openSections.drivers}
              onToggle={() => toggleSection('drivers')}
            >
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Ճանապարհորդություն ստեղծել</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Մուտք գործեք ձեր վարորդի հաշիվ</li>
                  <li>Սեղմեք "Նոր ճանապարհ" կոճակը</li>
                  <li>Լրացրեք մեկնակետը և նպատակակետը</li>
                  <li>Նշեք ամսաթիվը և ժամը</li>
                  <li>Ավելացրեք տեղերի քանակը և գինը</li>
                  <li>Հրապարակեք ճանապարհորդությունը</li>
                </ol>
              </div>
            </HelpSection>

            <HelpSection
              title="Ուղևորների համար"
              isOpen={openSections.passengers}
              onToggle={() => toggleSection('passengers')}
            >
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Ճանապարհորդություն գտնել</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Գնացեք "Ճանապարհներ" էջ</li>
                  <li>Օգտագործեք ֆիլտրերը որոնելու համար</li>
                  <li>Ընտրեք հարմար ճանապարհորդությունը</li>
                  <li>Սեղմեք "Կապվել վարորդի հետ" կոճակը</li>
                  <li>Գրեք հաղորդագրություն վարորդին</li>
                </ol>
              </div>
            </HelpSection>

            <HelpSection
              title="Հաղորդագրություններ և գնահատականներ"
              isOpen={openSections.messaging}
              onToggle={() => toggleSection('messaging')}
            >
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Հաղորդագրություններ ուղարկել</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Բոլոր հաղորդագրությունները կցուցադրվեն "Նամակներ" բաժնում</li>
                  <li>Կարող եք գրել անմիջապես վարորդին կամ ուղևորին</li>
                  <li>Ստացեք ծանուցումներ նոր հաղորդագրությունների համար</li>
                </ul>

                <h4 className="font-semibold text-gray-900 mt-4">Գնահատականներ տալ</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Ճանապարհորդությունից հետո կարող եք գնահատել մյուս կողմին</li>
                  <li>Սեղմեք "Գնահատել" կոճակը ճանապարհորդության էջից</li>
                  <li>Տվեք 1-5 աստղ գնահատական</li>
                  <li>Ավելացրեք մեկնաբանություն (ոչ պարտադիր)</li>
                </ul>
              </div>
            </HelpSection>

            <HelpSection
              title="Անվտանգություն և վստահություն"
              isOpen={openSections.safety}
              onToggle={() => toggleSection('safety')}
            >
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Անվտանգության խորհուրդներ</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Միշտ ստուգեք վարորդի և մեքենայի տվյալները</li>
                  <li>Կիսվեք ճանապարհորդության մանրամասներով ընտանիքի հետ</li>
                  <li>Գնահատեք մյուս օգտատերերին ճանապարհորդությունից հետո</li>
                  <li>Հաղորդեք խնդիրների մասին մեր աջակցության թիմին</li>
                </ul>
              </div>
            </HelpSection>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Չգտա՞ր քո հարցի պատասխանը</h2>
            <p className="text-gray-600 mb-6">
              Կապվիր մեզ հետ, և մենք օգնելու ենք քեզ:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Կապի մակարդակներ</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">support@taxiroutepro.am</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">+374 10 12-34-56</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">Երկ-Ուր 09:00-18:00</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Հակիրճ կապ</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:support@taxiroutepro.am"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center block"
                  >
                    Ուղարկել էլ. նամակ
                  </a>
                  <a
                    href="tel:+37410123456"
                    className="w-full border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center block"
                  >
                    Զանգահարել հիմա
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
