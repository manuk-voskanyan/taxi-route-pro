'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Layout } from '@/components/layout'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Կապվիր․ Ճանապարհորդիր․ Կիսվիր։
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Ժամանակակից հարթակ քաղաքների միջև տաքսի ճանապարհորդությունների համար։ Կամ վարորդ եք և ցանկանում եք կիսել ձեր ճանապարհը, կամ ուղևոր եք և փնտրում եք հարմար ճանապարհորդություն։
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/trips"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Գտնել ճանապարհ
              </Link>
              {status === 'authenticated' && session?.user?.userType === 'driver' ? (
                <Link
                  href="/create-trip"
                  className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-400 transition-colors border-2 border-white/20"
                >
                  Ստեղծել ճանապարհորդություն
                </Link>
              ) : (
                <Link
                  href="/auth/signup"
                  className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-400 transition-colors border-2 border-white/20"
                >
                  Սկսել վարել
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ինչպես է աշխատում
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Պարզ, անվտանգ և արդյունավետ քաղաքարի ճանապարհորդություն բոլորի համար
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Passengers */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-green-100 text-green-600 rounded-lg p-3 mr-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                </div>
                Ուղևորների համար
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 text-green-600 rounded-full p-2 mr-4 mt-1">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Փնտրել ճանապարհորդություններ</h4>
                    <p className="text-gray-600">Գտիր հասանելի ճանապարհորդություններ ելակետային քաղաք, նպատակետ և ամսաթվով</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 text-green-600 rounded-full p-2 mr-4 mt-1">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Կապվել վարորդի հետ</h4>
                    <p className="text-gray-600">Ուղղակիորեն չատ անիր վարորդների հետ՝ մանրամասներն իմանալու և տեղ ամրագրելու համար</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 text-green-600 rounded-full p-2 mr-4 mt-1">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Անվտանգ ճանապարհորդություն</h4>
                    <p className="text-gray-600">Վայելիր հարմարավետ ճանապարհորդությունը ստուգված վարորդների հետ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Drivers */}
            <div className="bg-blue-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-blue-100 text-blue-600 rounded-lg p-3 mr-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                  </svg>
                </div>
                Վարորդների համար
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-2 mr-4 mt-1">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ստեղծել ճանապարհորդություն</h4>
                    <p className="text-gray-600">Հրապարակիր ձեր նախատեսված ճանապարհը՝ նշելով ելակետը, նպատակակետը և հասանելի տեղերը</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-2 mr-4 mt-1">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ստանալ ուղևորներ</h4>
                    <p className="text-gray-600">Ստացիր հաղորդագրություններ հետաքրքրված ուղևորներից և հաստատիր ամրագրումները</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-2 mr-4 mt-1">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Աշխատել փող</h4>
                    <p className="text-gray-600">Կիսիր ծախսերդ և դարձրու ճանապարհորդությունդ շահույթաբեր</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
