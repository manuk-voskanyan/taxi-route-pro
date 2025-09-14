'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import socketService from '@/lib/socket'
import RatingModal from './rating-modal'
import Swal from 'sweetalert2'

export default function Chat({
  tripId,
  driverId,
  driverName,
  driverType = 'driver',
  tripDate,
  onClose,
  isOpen,
  onMessagesRead,
}) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const hasMarkedReadRef = useRef(false)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      let timeoutId
      
      const initializeSocket = async () => {
        try {
          // Initialize socket connection with error handling
          console.log('Initializing chat for trip:', tripId, 'user:', session.user.id)
          const socket = socketService.connect()
          
          // Wait for connection before joining room
          socket.on('connect', () => {
            console.log('Socket connected successfully, joining trip room:', tripId)
            socketService.joinTripRoom(tripId, session.user.id)
          })

          // Handle connection errors
          socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
          })

          // Join trip room immediately if already connected
          if (socket.connected) {
            console.log('Socket already connected, joining room immediately')
            socketService.joinTripRoom(tripId, session.user.id)
          }

          // Load existing messages and get the result
          console.log('Loading existing messages...')
          const loadedMessages = await fetchMessages()

          // Listen for real-time messages
          socketService.onNewMessage((data) => {
            console.log('New message received:', data)
            setMessages(prev => [...prev, data])
          })

          // Listen for typing indicators
          socketService.onUserTyping((data) => {
            if (data.userId !== session.user.id) {
              setOtherUserTyping(data.isTyping)
            }
          })

          // Listen for trip join confirmation
          socket.on('joined-trip', (data) => {
            console.log('Successfully joined trip room:', data)
          })

          // Listen for socket errors
          socket.on('error', (error) => {
            console.error('Socket error:', error)
          })

          // IMPROVED: Always mark messages as read when chat opens
          if (loadedMessages.length > 0) {
            console.log('📧 Chat opened - marking all received messages as read')
            await markAllAsReadImmediate(loadedMessages)
            hasMarkedReadRef.current = true
          } else {
            // Even if no messages to mark, still update the UI to show 0 unread
            console.log('📧 No messages found, but ensuring UI shows 0 unread')
            updateUnreadCountEverywhere(0)
          }

        } catch (error) {
          console.error('Socket initialization error:', error)
        }
      }

      // Delay socket initialization to avoid timeout issues
      timeoutId = setTimeout(initializeSocket, 100)

      return () => {
        if (timeoutId) clearTimeout(timeoutId)
        socketService.offAllListeners()
        hasMarkedReadRef.current = false; // Reset for next time chat opens
      }
    }
  }, [isOpen, tripId, session?.user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      console.log('Fetching messages for trip:', tripId, 'driver:', driverId)
      console.log('Current user:', session?.user?.id, session?.user?.name)
      
      const response = await fetch(`/api/messages?tripId=${tripId}&userId=${driverId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })
      const data = await response.json()
      console.log('Messages fetch response:', response.status, data)
      
      if (response.ok) {
        const fetchedMessages = data.messages || []
        setMessages(fetchedMessages)
        console.log('Loaded', fetchedMessages.length, 'messages')
        if (fetchedMessages && fetchedMessages.length > 0) {
          console.log('Sample message:', fetchedMessages[0])
        }
        return fetchedMessages; // Return the messages for immediate use
      } else {
        console.error('Failed to fetch messages:', data.error)
        if (response.status === 401) {
          console.error('Authentication failed - session might be invalid')
          Swal.fire({
            title: 'Նույնականացման սխալ',
            text: 'Նույնականացման սխալ: Խնդրում ենք թարմացնել էջը և կրկին մտնել:',
            icon: 'warning',
            confirmButtonText: 'Հասկանալի',
            confirmButtonColor: '#f59e0b',
          })
        } else {
          Swal.fire({
            title: 'Սխալ հաղորդագրությունները բեռնելիս',
            text: `Սխալ հաղորդագրությունները բեռնելիս: ${data.error}`,
            icon: 'error',
            confirmButtonText: 'Հասկանալի',
            confirmButtonColor: '#ef4444',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      Swal.fire({
        title: 'Ցանցային սխալ',
        text: `Ցանցային սխալ հաղորդագրությունները բեռնելիս: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Հասկանալի',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
    return []; // Return empty array on failure
  }

  const markAllAsRead = async (messagesToMark) => {
    try {
      console.log('=== MARK AS READ DEBUG ===')
      console.log('Total messages to check:', messagesToMark.length)
      console.log('Current user ID:', session?.user?.id)
      
      // Collect IDs that are not mine and are unread, from the provided list
      const unreadIds = messagesToMark
        .filter((m) => {
          const isForMe = m.receiver?._id === session?.user?.id
          const isUnread = !m.isRead
          console.log(`Message ${m._id?.slice(-6)}: receiver=${m.receiver?._id?.slice(-6)}, isForMe=${isForMe}, isRead=${m.isRead}, isUnread=${isUnread}`)
          return isForMe && isUnread
        })
        .map((m) => m._id)

      console.log('Unread message IDs to mark:', unreadIds)

      if (unreadIds.length === 0) {
        console.log('No unread messages found, skipping mark as read')
        // Still call callback to trigger UI refresh even if no messages to mark
        if (onMessagesRead) {
          console.log('Calling onMessagesRead callback with count: 0')
          onMessagesRead({
            conversationKey: `${tripId}-${driverId}`,
            count: 0,
          })
        }
        return
      }

      // Update backend
      console.log('Sending PUT request to mark messages as read')
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messageIds: unreadIds }),
      })
      
      console.log('Mark as read API response:', response.status)

      if (response.ok) {
        // Update local state immediately
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            unreadIds.includes(msg._id) ? { ...msg, isRead: true } : msg
          )
        )

        // Notify the parent component directly via callback
        if (onMessagesRead) {
          console.log('Calling onMessagesRead callback with count:', unreadIds.length)
          onMessagesRead({
            conversationKey: `${tripId}-${driverId}`,
            count: unreadIds.length,
          })
        }
      } else {
        console.log('Failed to mark messages as read:', response.status)
      }
    } catch (error) {
      console.error('Error in markAllAsRead:', error)
    }
  }

  // IMPROVED: Mark messages as read with immediate UI feedback
  const markAllAsReadImmediate = async (messagesToMark) => {
    try {
      console.log('🚀 MARK AS READ - Processing messages for user:', session?.user?.id)
      
      // Step 1: Filter unread messages that belong to current user
      const unreadIds = messagesToMark
        .filter((m) => {
          const isForMe = m.receiver?._id === session?.user?.id
          const isUnread = !m.isRead
          console.log(`Message ${m._id?.slice(-6)}: isForMe=${isForMe}, isUnread=${isUnread}`)
          return isForMe && isUnread
        })
        .map((m) => m._id)

      console.log('📧 Found', unreadIds.length, 'unread messages to mark as read')

      // Step 2: IMMEDIATE UI feedback - show the user that messages are being marked as read
      updateUnreadCountEverywhere(0)

      if (unreadIds.length === 0) {
        console.log('✅ No unread messages found - UI already updated')
        return
      }

      // Step 3: Update backend 
      console.log('🔄 Updating backend database...')
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messageIds: unreadIds }),
      })
      
      if (response.ok) {
        console.log('✅ Backend successfully updated', unreadIds.length, 'messages as read')
        
        // Step 4: Update local chat state after backend success
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            unreadIds.includes(msg._id) ? { ...msg, isRead: true } : msg
          )
        )

        // Step 5: Confirm UI updates after database processing
        setTimeout(() => {
          console.log('🔄 Confirming UI updates after database processing')
          updateUnreadCountEverywhere(0, true) // Force refresh with cache busting
        }, 800) // Increased delay for Sanity processing

        // Step 6: Final confirmation refresh
        setTimeout(() => {
          console.log('🔄 Final confirmation refresh')
          updateUnreadCountEverywhere(0, true)
        }, 2000)
        
      } else {
        console.error('❌ Backend update failed, status:', response.status)
        const errorText = await response.text()
        console.error('❌ Error details:', errorText)
        // Still keep UI consistent even if backend fails
      }
      
    } catch (error) {
      console.error('❌ Error in markAllAsReadImmediate:', error)
      // Still ensure UI shows correct state
      updateUnreadCountEverywhere(0)
    }
  }

  // IMPROVED: Update unread count across ALL components with better timing
  const updateUnreadCountEverywhere = (newCount, forceRefresh = false) => {
    console.log('🔄 UPDATING UNREAD COUNT EVERYWHERE:', newCount, forceRefresh ? '(FORCED)' : '')
    
    // 1. Notify parent component (Messages page)
    if (onMessagesRead) {
      onMessagesRead({
        conversationKey: `${tripId}-${driverId}`,
        count: newCount,
      })
    }
    
    // 2. Force navigation badge refresh with multiple attempts
    if (typeof window !== 'undefined') {
      // Immediate refresh
      window.dispatchEvent(new CustomEvent('refreshUnreadCount'))
      
      // Staggered refreshes for better reliability
      if (forceRefresh) {
        setTimeout(() => window.dispatchEvent(new CustomEvent('refreshUnreadCount')), 200)
        setTimeout(() => window.dispatchEvent(new CustomEvent('refreshUnreadCount')), 600)
        setTimeout(() => window.dispatchEvent(new CustomEvent('refreshUnreadCount')), 1200)
      } else {
        // Standard refresh pattern
        setTimeout(() => window.dispatchEvent(new CustomEvent('refreshUnreadCount')), 100)
        setTimeout(() => window.dispatchEvent(new CustomEvent('refreshUnreadCount')), 300)
      }
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      
      const messageData = {
        tripId,
        receiverId: driverId,
        content: newMessage.trim(),
        messageType: 'text',
        sender: {
          _id: session.user.id,
          name: session.user.name
        },
        createdAt: new Date().toISOString()
      }

      // Save to database first
      console.log('Sending message to database...')
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          tripId,
          receiverId: driverId,
          content: newMessage.trim(),
        }),
      })

      console.log('Message save response:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Message saved successfully:', result)
        
        // Send via Socket.io for real-time delivery
        const completeMessageData = {
          ...messageData,
          _id: result.data._id,
          createdAt: result.data.createdAt
        }
        console.log('Broadcasting message via Socket.io:', completeMessageData)
        socketService.sendMessage(completeMessageData)
        
        // Add message to local state if not already added by socket
        setMessages(prev => {
          const messageExists = prev.some(msg => msg._id === result.data._id)
          return messageExists ? prev : [...prev, result.data]
        })
      } else {
        const errorData = await response.json()
        console.error('Failed to save message:', errorData)
        Swal.fire({
          title: 'Հաղորդագրությունը չհաջողվեց ուղարկել',
          text: 'Հաղորդագրությունը չհաջողվեց ուղարկել: ' + errorData.error,
          icon: 'error',
          confirmButtonText: 'Հասկանալի',
          confirmButtonColor: '#ef4444',
        })
      }

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (!isTyping) {
      setIsTyping(true)
      socketService.sendTyping(tripId, session.user.id, session.user.name, true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socketService.sendTyping(tripId, session.user.id, session.user.name, false)
    }, 1000)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleOpenRating = () => {
    setRatingModalOpen(true)
  }

  const handleCloseRating = () => {
    setRatingModalOpen(false)
  }

  const handleRatingSubmitted = (ratingData) => {
    console.log('Rating submitted:', ratingData)
    // Optionally refresh ratings or show success message
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      data-chat-modal
      data-trip-id={tripId}
      data-other-user-id={driverId}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">{driverName}</h3>
              <p className="text-blue-100 text-sm">{driverType === 'driver' ? 'Վարորդ' : 'Ուղևոր'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Rating Button */}
            <button
              onClick={handleOpenRating}
              className="text-blue-100 hover:text-white transition-colors p-1 rounded-md hover:bg-blue-500"
              title="Գնահատել օգտատիրոջը"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors p-1 rounded-md hover:bg-blue-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Բեռնում է հաղորդագրությունները...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 text-center">
                <p>Հաղորդագրություններ չկան</p>
                <p className="text-sm mt-1">Նախաձեռնիր խոսակցությունը!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message._id} className={`flex ${
                  message.sender._id === session?.user?.id ? 'justify-end' : 'justify-start'
                }`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender._id === session?.user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender._id === session?.user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Գրիր հաղորդագրություն..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Rating Modal */}
      <RatingModal
        tripId={tripId}
        otherUserId={driverId}
        otherUserName={driverName}
        otherUserType={driverType}
        tripDate={tripDate}
        isOpen={ratingModalOpen}
        onClose={handleCloseRating}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  )
}
