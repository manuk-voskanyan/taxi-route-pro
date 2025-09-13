'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Layout } from '@/components/layout'
import Chat from '@/components/chat'

export default function Messages() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations()
    }
  }, [session?.user?.id])

  // Refresh conversations when returning from chat page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.id) {
        fetchConversations()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [session?.user?.id])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/conversations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })
      const data = await response.json()
      if (response.ok) {
        setConversations(data.conversations || [])
      } else {
        console.error('Failed to fetch conversations:', data.error)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const openChat = (conversation) => {
    setSelectedConversation(conversation)
    setChatOpen(true)
  }

  const closeChat = () => {
    setChatOpen(false)
    setSelectedConversation(null)
    // Refresh conversations when chat closes
    fetchConversations()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('hy-AM', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('hy-AM', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const getOtherUser = (conversation) => {
    return conversation.otherUser
  }

  if (!session) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Մուտք գործել հարկավոր է</h1>
            <p className="text-gray-600">Հաղորդագրությունները դիտելու համար մուտք գործեք ձեր հաշիվ:</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Հաղորդագրություններ</h1>
            <p className="text-gray-600">Ձեր բոլոր խոսակցությունները մեկ տեղում</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center justify-center">
                <div className="text-xl text-gray-600">Բեռնում է խոսակցությունները...</div>
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Խոսակցություններ չկան</h3>
              <p className="text-gray-600 mb-6">
                Դեռ հաղորդագրություններ չեք փոխանակել ոչ ոքի հետ: Գնացեք ճանապարհորդությունների էջ և կապվեք վարորդների հետ:
              </p>
              <a 
                href="/trips"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Դիտել ճանապարհորդությունները
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              {conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation)
                if (!otherUser) return null

                return (
                  <div 
                    key={`${conversation.trip._id}-${otherUser._id}`}
                    className="p-6 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openChat(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="mr-4">
                          {otherUser.avatar?.asset?.url ? (
                            <img
                              src={otherUser.avatar.asset.url}
                              alt={otherUser.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="bg-gray-200 rounded-full p-3">
                              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
                            {conversation.lastMessage && (
                              <span className="text-sm text-gray-500">
                                {formatDate(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">
                              {conversation.trip.fromCity} → {conversation.trip.toCity}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage.sender._id === session.user.id ? 'Դուք: ' : ''}
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && selectedConversation && (
        <Chat
          tripId={selectedConversation.trip._id}
          driverId={selectedConversation.otherUser._id}
          driverName={selectedConversation.otherUser.name}
          onClose={closeChat}
          isOpen={chatOpen}
          onMessagesRead={() => {}}
        />
      )}
    </Layout>
  )
}
