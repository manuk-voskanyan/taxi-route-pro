import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect() {
    if (!this.socket || !this.connected) {
      // Get the current window location to detect the correct port
      const socketUrl = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}` 
        : (process.env.NODE_ENV === 'production' 
           ? process.env.NEXTAUTH_URL 
           : 'http://localhost:3000')

      this.socket = io(socketUrl, {
        path: '/api/socket',
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5
      })

      this.socket.on('connect', () => {
        console.log('Connected to Socket.io server')
        this.connected = true
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from Socket.io server')
        this.connected = false
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error)
        this.connected = false
      })
    }

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  joinTripRoom(tripId, userId) {
    if (this.socket && this.connected) {
      this.socket.emit('join-trip', { tripId, userId })
    }
  }

  sendMessage(messageData) {
    if (this.socket && this.connected) {
      this.socket.emit('send-message', messageData)
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback)
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback)
    }
  }

  sendTyping(tripId, userId, userName, isTyping) {
    if (this.socket && this.connected) {
      this.socket.emit('typing', { tripId, userId, userName, isTyping })
    }
  }

  offAllListeners() {
    if (this.socket) {
      this.socket.off('new-message')
      this.socket.off('user-typing')
    }
  }
}

// Create a singleton instance
const socketService = new SocketService()

export default socketService
