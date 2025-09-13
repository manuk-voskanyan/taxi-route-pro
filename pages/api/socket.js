import { Server } from 'socket.io'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket.io already initialized')
    res.end()
    return
  }

  console.log('Initializing Socket.io server...')
  
  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXTAUTH_URL] 
        : ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  })
  
  res.socket.server.io = io

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Join a trip room for targeted messaging
    socket.on('join-trip', (data) => {
      try {
        const { tripId, userId } = data
        socket.join(`trip-${tripId}`)
        socket.userId = userId
        socket.currentTripId = tripId
        console.log(`User ${userId} joined trip room: trip-${tripId}`)
        
        // Confirm room join
        socket.emit('joined-trip', { tripId, userId })
      } catch (error) {
        console.error('Error joining trip room:', error)
        socket.emit('error', { message: 'Failed to join trip room' })
      }
    })

    // Handle sending messages
    socket.on('send-message', (data) => {
      try {
        console.log('Broadcasting message to room:', `trip-${data.tripId}`)
        // Broadcast to all users in the trip room including sender for confirmation
        io.to(`trip-${data.tripId}`).emit('new-message', {
          ...data,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle typing indicators
    socket.on('typing', (data) => {
      try {
        socket.to(`trip-${data.tripId}`).emit('user-typing', {
          userId: data.userId,
          userName: data.userName,
          isTyping: data.isTyping
        })
      } catch (error) {
        console.error('Error handling typing indicator:', error)
      }
    })

    // Handle user disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.id}, reason: ${reason}`)
      if (socket.currentTripId) {
        socket.to(`trip-${socket.currentTripId}`).emit('user-left', {
          userId: socket.userId
        })
      }
    })

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  })

  console.log('Socket.io server initialized successfully')
  res.end()
}

export default SocketHandler
