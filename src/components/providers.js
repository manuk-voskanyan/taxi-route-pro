'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

export function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
