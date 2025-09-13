'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import socketService from '@/lib/socket'

export default function Chat({
  tripId,
  driverId,
  driverName,
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
      
      // IMMEDIATELY notify parent that this conversation should show 0 unread
      console.log('🔥 CHAT OPENED - Immediately setting unread count to 0')
      if (onMessagesRead) {
        onMessagesRead({
          conversationKey: `${tripId}-${driverId}`,
          count: 0,
        })
      }
      
      // Force immediate refresh of navigation badge
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refreshUnreadCount'))
      }
      
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

          // Mark messages as read in background (after UI is already updated)
          if (!hasMarkedReadRef.current) {
            setTimeout(() => markAllAsRead(loadedMessages), 500) // Background task
            hasMarkedReadRef.current = true
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
          alert('Authentication error. Please refresh the page and try logging in again.')
        } else {
          alert(`Error loading messages: ${data.error}`)
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      alert(`Network error loading messages: ${error.message}`)
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
        console.error('Failed to mark messages as read:', response.status)
      }
    } catch (error) {
      console.error('Error in markAllAsRead:', error)
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
        alert('Failed to send message: ' + errorData.error)
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
              <p className="text-blue-100 text-sm">Վարորդ</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
    </div>
  )
}
