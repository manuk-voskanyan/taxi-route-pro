'use client'

import { Layout } from '@/components/layout'

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Գաղտնիության քաղաքականություն
            </h1>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Ծանուցում
                </h2>
                <p className="text-gray-700 mb-4">
                  TaxiRoute Pro-ն հարգում է ձեր գաղտնիությունը և պարտավորվում է պաշտպանել ձեր անձնական տվյալները: Այս գաղտնիության քաղաքականությունը բացատրում է, թե ինչպես ենք մենք հավաքում, օգտագործում և պաշտպանում ձեր տեղեկությունները մեր ծառայություն օգտագործելիս:
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Տվյալների հավաքում
                </h2>
                <p className="text-gray-700 mb-4">
                  Մենք հավաքում ենք հետևյալ տեսակի տեղեկություններ:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Անուն և էլ. հասցե</li>
                  <li>Հեռախոսահամար</li>
                  <li>Մեքենայի տեղեկություններ (վարորդների համար)</li>
                  <li>Ճանապարհորդության պատմություն</li>
                  <li>Տեղակայման տվյալներ (անհրաժեշտության դեպքում)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Տվյալների օգտագործում
                </h2>
                <p className="text-gray-700 mb-4">
                  Ձեր տվյալները մենք օգտագործում ենք:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Ծառայություն տրամադրելու համար</li>
                  <li>Վարորդների և ուղևորների միջև կապ հաստատելու համար</li>
                  <li>Անվտանգության և որակի ապահովման համար</li>
                  <li>Ծառայության բարելավման համար</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Տվյալների պաշտպանություն
                </h2>
                <p className="text-gray-700 mb-4">
                  Մենք օգտագործում ենք ժամանակակից տեխնոլոգիական միջոցներ ձեր անձնական տվյալները պաշտպանելու համար: Ձեր տվյալները երբեք չենք կիսում երրորդ կողմերի հետ առանց ձեր համաձայնության:
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Cookie-ներ
                </h2>
                <p className="text-gray-700 mb-4">
                  Մեր կայքը օգտագործում է cookie-ներ ավելի լավ օգտագործողական փորձ ապահովելու համար: Կարող եք անջատել cookie-ները ձեր բրաուզերի կարգավորումներում:
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Ձեր իրավունքները
                </h2>
                <p className="text-gray-700 mb-4">
                  Դուք իրավունք ունեք:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Հասանելիություն ձեր անձնական տվյալներին</li>
                  <li>Ուղղել սխալ տվյալները</li>
                  <li>Ջնջել ձեր հաշիվը</li>
                  <li>Սահմանափակել տվյալների մշակումը</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Կապ
                </h2>
                <p className="text-gray-700">
                  Եթե ունեք հարցեր մեր գաղտնիության քաղաքականության վերաբերյալ, խնդրում ենք կապվել մեզ հետ՝ 
                  <span className="font-semibold text-blue-600"> support@taxiroutepro.am</span> էլ. հասցեով:
                </p>
              </section>

              <div className="text-sm text-gray-500 mt-8">
                Վերջին թարմացում՝ {new Date().toLocaleDateString('hy-AM')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
