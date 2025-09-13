# Real-time Chat System Documentation

## Overview
This taxi route application now includes a complete real-time chat system using Socket.io and Next.js, allowing passengers and drivers to communicate instantly.

## Features

### ✅ Real-time Messaging
- Instant message delivery using WebSocket connections
- Trip-based chat rooms for organized conversations
- Message persistence with Sanity CMS
- Typing indicators to show when someone is typing

### ✅ User Experience
- Beautiful chat modal with Armenian language support
- Auto-scroll to latest messages
- Message timestamps and read status
- Real-time notifications for new messages
- Responsive design for mobile and desktop

### ✅ Technical Implementation
- **Socket.io Server**: `/pages/api/socket.js` - Handles WebSocket connections
- **Socket Service**: `/src/lib/socket.js` - Client-side Socket.io wrapper
- **Chat Component**: `/src/components/chat.js` - Main chat interface
- **Message API**: `/src/app/api/messages/route.js` - Database operations
- **Notifications**: `/src/components/notification.js` - Toast notifications

## How It Works

### 1. Connection Flow
1. User visits the trips page
2. Socket.io server initializes automatically via providers
3. When user opens a chat, they join a trip-specific room
4. Real-time communication begins within that room

### 2. Message Flow
1. User types and sends a message
2. Message is immediately sent via Socket.io for real-time delivery
3. Message is simultaneously saved to Sanity database for persistence
4. Other users in the trip room receive the message instantly
5. Recipients see a notification if not currently in the chat

### 3. Trip Integration
- Chat is accessible from the "Contact Driver" button on each trip
- Each trip has its own isolated chat room
- Only passengers and the trip driver can access the chat for that trip

## Technical Architecture

### Socket.io Server (`/pages/api/socket.js`)
```javascript
// Trip-based rooms for organized messaging
socket.on('join-trip', (data) => {
  socket.join(`trip-${data.tripId}`)
})

// Real-time message broadcasting
socket.on('send-message', (data) => {
  io.to(`trip-${data.tripId}`).emit('new-message', data)
})
```

### Database Integration
- Messages are stored in Sanity with the existing message schema
- Real-time delivery via Socket.io
- Persistent storage for message history
- Reference to trip, sender, and receiver

### Security Considerations
- Authentication required via NextAuth
- Trip-based room isolation
- Message sender verification
- CORS configuration for production

## Usage Instructions

### For Passengers:
1. Browse available trips on `/trips` page
2. Click "Կապվել վարորդի հետ" (Contact Driver) button
3. Chat modal opens with real-time messaging
4. Type and send messages instantly
5. Receive notifications for new messages

### For Drivers:
1. Messages from passengers appear as notifications
2. Click notifications or access chat from trip management
3. Real-time communication with passengers
4. Typing indicators show passenger activity

## Configuration

### Environment Variables
- `NEXTAUTH_URL`: Required for Socket.io connection in production
- Sanity configuration: Messages are stored using existing schema

### Development Setup
1. Install dependencies: `npm install socket.io socket.io-client`
2. Socket.io server runs automatically when pages are loaded
3. Real-time chat is available immediately on the trips page

### Production Deployment
- Socket.io server initializes automatically
- WebSocket connections fall back to polling if needed
- CORS configured for production domains

## Testing

### Manual Testing Checklist:
- [ ] Open two browser sessions with different users
- [ ] Navigate to the same trip page
- [ ] Open chat from passenger account
- [ ] Send messages and verify real-time delivery
- [ ] Check typing indicators
- [ ] Verify message persistence after page refresh
- [ ] Test notifications for new messages

### Browser Network Tab:
- Look for WebSocket connection to `/api/socket`
- Verify Socket.io events in browser console
- Check for message API calls to `/api/messages`

## Troubleshooting

### Socket Connection Issues:
1. Check browser console for Socket.io connection errors
2. Verify `/api/socket` endpoint accessibility
3. Check CORS configuration for production
4. Ensure WebSocket support in hosting environment

### Message Delivery Problems:
1. Verify user authentication status
2. Check Sanity database connection
3. Confirm trip IDs match between users
4. Validate message schema in Sanity

### Performance Optimization:
- Socket connections are reused across components
- Messages are paginated for large conversations
- Typing indicators debounced to reduce server load
- Automatic cleanup of socket listeners

## Future Enhancements
- File/image sharing in chat
- Message reactions and replies
- Push notifications for mobile apps
- Chat moderation and reporting
- Message encryption for privacy
- Offline message queuing

## Support
For issues or questions about the real-time chat system, check:
1. Browser console for Socket.io connection logs
2. Server logs for WebSocket events
3. Network tab for API call failures
4. Sanity Studio for message data validation
