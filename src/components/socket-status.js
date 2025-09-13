'use client'

import { useState, useEffect } from 'react'
import socketService from '@/lib/socket'

export default function SocketStatus() {
  const [status, setStatus] = useState('disconnected')
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const socket = socketService.connect()

      socket.on('connect', () => {
        setStatus('connected')
        setShowStatus(true)
        setTimeout(() => setShowStatus(false), 3000)
      })

      socket.on('disconnect', () => {
        setStatus('disconnected')
        setShowStatus(true)
      })

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setStatus('error')
        setShowStatus(true)
      })

      return () => {
        socket.off('connect')
        socket.off('disconnect')
        socket.off('connect_error')
      }
    }
  }, [])

  if (!showStatus) return null

  const statusConfig = {
    connected: { color: 'bg-green-500', text: 'Real-time chat connected' },
    disconnected: { color: 'bg-red-500', text: 'Chat disconnected - trying to reconnect...' },
    error: {  }
  }

  const config = statusConfig[status]

  return (
    <div className={`fixed bottom-4 left-4 ${config.color} text-white px-4 py-2 rounded-lg shadow-lg text-sm z-40`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-white' : 'bg-white animate-pulse'}`}></div>
        <span>{config.text}</span>
      </div>
    </div>
  )
}
