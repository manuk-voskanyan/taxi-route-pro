import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { client } from '@/sanity/lib/client'

// GET - Fetch all conversations for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Query to get all messages where the current user is sender or receiver
    // Group by trip and get the latest message for each conversation
    const query = `
      *[_type == "message" && (sender._ref == "${userId}" || receiver._ref == "${userId}")] {
        _id,
        content,
        createdAt,
        isRead,
        sender->{_id, name, avatar},
        receiver->{_id, name, avatar},
        trip->{
          _id,
          fromCity,
          toCity,
          departureDate,
          driver->{_id, name, avatar}
        }
      }
      | order(createdAt desc)
    `

    const messages = await client.fetch(query)

    // Group messages into conversations. A conversation is unique to a trip and the other user.
    const conversationsMap = new Map()

    for (const message of messages) {
      if (!message.trip) continue; // Skip messages with no trip association

      const otherUser = message.sender._id === userId ? message.receiver : message.sender
      if (!otherUser) continue; // Skip messages without a valid sender/receiver

      const conversationKey = `${message.trip._id}-${otherUser._id}`

      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          trip: message.trip,
          otherUser: otherUser,
          messages: [],
          unreadCount: 0,
          lastMessage: null
        })
      }

      const conversation = conversationsMap.get(conversationKey)
      conversation.messages.push(message)

      if (message.receiver._id === userId && !message.isRead) {
        conversation.unreadCount++
      }

      // The list is sorted desc, so the first message we see is the latest
      if (!conversation.lastMessage) {
        conversation.lastMessage = message
      }
    }

    // Convert map to array
    const conversations = Array.from(conversationsMap.values())

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
