'use client'

import { useState, useEffect } from 'react'
import { Navigation } from './navigation'

export function Layout({ children }) {
  const [showDemoNotice, setShowDemoNotice] = useState(false)
  
  useEffect(() => {
    // Check if using mock storage only on client side
    const useMockStorage = !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    setShowDemoNotice(useMockStorage)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mock Storage Notice - only show after hydration */}
      {/* {showDemoNotice && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Ցուցադրական ռեժիմ:</strong> Օգտագործվում է ժամանակավոր պահոց: Տվյալները կվերակայվեն սերվերի վերագործարկման ժամանակ: 
              <a href="/SETUP_GUIDE.md" className="underline ml-1">Կարգավորել Sanity-ն մշտական տվյալների համար</a>
            </p>
          </div>
        </div>
      )} */}
      <Navigation />
      <main>{children}</main>
    </div>
  )
}
