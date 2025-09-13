'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import socketService from '@/lib/socket'

export default function MessageNotifications() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (session?.user?.id && typeof window !== 'undefined') {
      let timeoutId
      
      const initializeNotifications = () => {
        try {
          const socket = socketService.connect()

          // Listen for new messages when not in chat
          socketService.onNewMessage((data) => {
            console.log('Notification received:', data)
            // Only show notification if message is not from current user
            if (data.sender && data.sender._id !== session.user.id) {
              const chatModal = document.querySelector('[data-chat-modal]')
              const isChatOpenForThisMessage =
                chatModal &&
                chatModal.getAttribute('data-trip-id') === data.tripId &&
                (chatModal.getAttribute('data-other-user-id') === data.sender._id ||
                  chatModal.getAttribute('data-other-user-id') === data.receiver._id)

              // Don't show notification if already on messages page or if chat is open for this convo
              const isOnMessagesPage = window.location.pathname === '/messages'

              if (!isOnMessagesPage && !isChatOpenForThisMessage) {
                const notification = {
                  id: Date.now(),
                  message: `${data.sender.name}: ${data.content.slice(0, 50)}${data.content.length > 50 ? '...' : ''}`,
                  timestamp: new Date(),
                  tripId: data.tripId
                }
                
                setNotifications(prev => [...prev, notification])

                // Auto-remove notification after 8 seconds
                setTimeout(() => {
                  setNotifications(prev => prev.filter(n => n.id !== notification.id))
                }, 8000)
              }
            }
          })
        } catch (error) {
          console.error('Notification socket error:', error)
        }
      }

      // Delay initialization to prevent timeout issues
      timeoutId = setTimeout(initializeNotifications, 200)

      return () => {
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
  }, [session?.user?.id])

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right"
        >
          <div className="flex items-start justify-between">
            <div 
              className="flex-1 cursor-pointer hover:bg-blue-700 rounded p-1 transition-colors" 
              onClick={() => {
                window.location.href = '/messages'
                removeNotification(notification.id)
              }}
            >
              <p className="text-sm font-medium">Նոր հաղորդագրություն</p>
              <p className="text-sm text-blue-100 mt-1">{notification.message}</p>
              <p className="text-xs text-blue-200 mt-1">Սեղմիր՝ բացելու համար</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-blue-100 hover:text-white flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
