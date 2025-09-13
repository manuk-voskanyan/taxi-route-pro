import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { client } from '@/sanity/lib/client'

// GET - Fetch messages for a trip
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tripId = searchParams.get('tripId')
    const userId = searchParams.get('userId')

    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 })
    }

    // Build query to fetch messages between current user and other party
    let query = `*[_type == "message" && trip._ref == $tripId && (
      (sender._ref == $currentUserId && receiver._ref == $otherUserId) ||
      (sender._ref == $otherUserId && receiver._ref == $currentUserId)
    )] | order(createdAt asc) {
      _id,
      content,
      messageType,
      isRead,
      createdAt,
      sender->{_id, name, avatar},
      receiver->{_id, name, avatar},
      trip->{_id, fromCity, toCity}
    }`

    const params = {
      tripId: tripId,
      currentUserId: session.user.id,
      otherUserId: userId,
    }

    const messages = await client.fetch(query, params)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tripId, receiverId, content, messageType = 'text' } = body

    if (!tripId || !receiverId || !content) {
      return NextResponse.json({ 
        error: 'Trip ID, receiver ID, and content are required' 
      }, { status: 400 })
    }

    // Create the message document
    const messageDoc = {
      _type: 'message',
      trip: {
        _type: 'reference',
        _ref: tripId
      },
      sender: {
        _type: 'reference',
        _ref: session.user.id
      },
      receiver: {
        _type: 'reference',
        _ref: receiverId
      },
      content,
      messageType,
      isRead: false, // Always create as unread - receiver will mark as read when they open chat
      createdAt: new Date().toISOString()
    }

    const result = await client.create(messageDoc)

    // Fetch the complete message with populated references
    const completeMessage = await client.fetch(
      `*[_id == "${result._id}"][0]{
        _id,
        content,
        messageType,
        isRead,
        createdAt,
        sender->{_id, name, avatar},
        receiver->{_id, name, avatar},
        trip->{_id, fromCity, toCity}
      }`
    )

    return NextResponse.json({ 
      message: 'Message sent successfully', 
      data: completeMessage 
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

// PUT - Mark messages as read
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Handle bulk mark as read for conversation
    if (body.markAllAsReadForConversation) {
      const { tripId, userId } = body
      
      if (!tripId || !userId) {
        return NextResponse.json({ error: 'Trip ID and User ID are required' }, { status: 400 })
      }

      // Find all unread messages for this conversation where current user is receiver
      const query = `*[_type == "message" && trip._ref == $tripId && 
        ((sender._ref == $currentUserId && receiver._ref == $otherUserId) ||
         (sender._ref == $otherUserId && receiver._ref == $currentUserId)) &&
        receiver._ref == $currentUserId && isRead == false]{_id}`

      const params = {
        tripId,
        currentUserId: session.user.id,
        otherUserId: userId,
      }

      const unreadMessages = await client.fetch(query, params)
      
      if (unreadMessages.length > 0) {
        const updates = unreadMessages.map(msg => 
          client.patch(msg._id).set({ isRead: true })
        )
        
        await client.transaction(updates).commit()
      }

      return NextResponse.json({ 
        message: 'Messages marked as read',
        count: unreadMessages.length
      })
    }

    // Handle individual message IDs
    const { messageIds } = body

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json({ error: 'Message IDs array is required' }, { status: 400 })
    }

    // Mark messages as read
    const updates = messageIds.map(id => ({
      id,
      patch: {
        isRead: true
      }
    }))

    await client.transaction(updates.map(update => 
      client.patch(update.id).set(update.patch)
    )).commit()

    return NextResponse.json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error('Error updating messages:', error)
    return NextResponse.json({ error: 'Failed to update messages' }, { status: 500 })
  }
}
