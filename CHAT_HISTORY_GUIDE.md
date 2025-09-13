# 💬 Chat History - Complete Guide

## 📍 **Where Chat History is Stored**

### **🗄️ Primary Storage: Sanity CMS**
Your chat history is **permanently stored** in Sanity CMS:

**Database Details:**
- **Platform**: Sanity.io Cloud Database
- **Collection**: `message` documents  
- **Storage Type**: NoSQL document database
- **Backup**: Automatically backed up by Sanity
- **Persistence**: Messages stored forever (until manually deleted)

### **📋 Message Document Structure:**
```javascript
{
  _id: "unique-message-id-12345",
  _type: "message",
  _createdAt: "2025-09-13T21:30:00.000Z",
  
  // Content
  content: "Hello! Are you still available for the trip?",
  messageType: "text",
  isRead: false,
  createdAt: "2025-09-13T21:30:00.000Z",
  
  // References (linked to other documents)
  trip: {
    _ref: "trip-document-id",
    _type: "reference"
  },
  sender: {
    _ref: "user-document-id-sender", 
    _type: "reference"
  },
  receiver: {
    _ref: "user-document-id-receiver",
    _type: "reference"
  },
  
  // Optional
  attachments: [] // Future feature for images/files
}
```

## 🔍 **How to Access Your Chat History**

### **Method 1: Messages Page (Recommended)**
**URL**: `http://localhost:3001/messages`

**What you'll see:**
- All your conversations organized by trip
- Last message preview for each conversation
- Unread message counts
- Trip details (From City → To City)
- Click any conversation to view full chat history

### **Method 2: From Trips Page**
1. Go to `http://localhost:3001/trips`
2. Click "Կապվել վարորդի հետ" (Contact Driver) on any trip
3. Chat modal opens showing **full conversation history** for that trip
4. Scroll up to see older messages

### **Method 3: API Direct Access**
For developers or advanced users:

**Get all messages for a specific trip:**
```bash
curl "http://localhost:3001/api/messages?tripId=YOUR_TRIP_ID&userId=OTHER_USER_ID" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Get all conversations:**
```bash
curl "http://localhost:3001/api/conversations" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### **Method 4: Sanity Studio (Admin Access)**
If you have admin access to your Sanity project:
1. Go to your Sanity Studio URL
2. Navigate to "Message" documents
3. View all messages directly in the database
4. Filter by user, trip, or date

## 📊 **Chat History Features**

### **✅ What's Included:**
- **All Messages**: Every message ever sent/received
- **Timestamps**: Exact time each message was sent
- **User Information**: Who sent each message (name, avatar)
- **Trip Context**: Which trip the conversation belongs to
- **Read Status**: Whether messages have been read
- **Message Types**: Text, booking requests, trip updates

### **✅ Automatic Organization:**
- **By Trip**: Each trip has its own conversation thread
- **By Time**: Messages sorted chronologically
- **By Participants**: Only shows messages between you and other trip participants

### **✅ Cross-Device Sync:**
- Messages sync across all devices instantly
- Chat history available on phone, tablet, desktop
- Real-time updates when new messages arrive

## 🛡️ **Privacy & Security**

### **Who Can See Your Messages:**
- **You** (sender or receiver)
- **Trip Participants Only** (driver + passengers of that specific trip)
- **Nobody Else** - messages are private to each trip

### **Data Protection:**
- **Encrypted in Transit**: HTTPS for all communication
- **Access Control**: Authentication required to view messages
- **Trip Isolation**: Can't see messages from trips you're not part of

## 🔧 **Testing Your Chat History**

### **Quick Test:**
1. **Send a test message**: Go to any trip and send a message
2. **Close the chat**: Close the modal or navigate away
3. **Check messages page**: Go to `/messages` - your message should be there
4. **Reopen chat**: Click the conversation - full history loads
5. **Refresh page**: Refresh browser - messages still there (persistent)

### **Multi-Device Test:**
1. Send messages from one device/browser
2. Open another device/browser and sign in
3. Go to messages page - all history synced
4. Send message from second device
5. Check first device - real-time sync

## 📈 **Message Statistics**

### **View Your Message Stats:**
From the debug panel (🐛 icon):
- Total messages sent/received
- Most active conversations
- Recent message activity
- Connection status history

### **Admin Analytics (Sanity Studio):**
- Total messages in system
- Messages per trip
- User activity patterns
- Most popular routes with messaging

## 🚨 **Troubleshooting Chat History**

### **If Chat History Doesn't Load:**
1. **Check Authentication**: Make sure you're logged in
2. **Check Network**: Ensure internet connection
3. **Check Console**: Open browser console for error messages
4. **Try Refresh**: Refresh the page to reload messages
5. **Check Debug Panel**: Click 🐛 icon for detailed logs

### **If Messages Are Missing:**
1. **Check Trip Association**: Messages are tied to specific trips
2. **Check User Permissions**: Only trip participants see messages
3. **Check Date Range**: Very old messages might need different query
4. **Check Sanity Connection**: Verify database connectivity

### **Console Commands for Debugging:**
```javascript
// In browser console:
// Check local message state (if any)
console.log('Current messages:', localStorage.getItem('messages'))

// Check session info
console.log('User session:', JSON.parse(localStorage.getItem('session') || '{}'))
```

## 🔄 **Message Backup & Export**

### **Automatic Backups:**
- **Sanity Cloud**: Automatically backs up all data
- **Redundancy**: Multiple server locations
- **Version History**: Previous versions of messages kept

### **Manual Export (Future Feature):**
- Export conversation history as PDF
- Download messages as JSON
- Email conversation transcripts

## ⚡ **Real-Time vs Stored History**

### **Real-Time Messages:**
- **Delivery**: Instant via Socket.io WebSocket
- **Temporary**: Held in memory until saved to database
- **Speed**: Millisecond delivery between users

### **Stored History:**
- **Persistence**: Saved to Sanity database immediately  
- **Permanence**: Available forever across sessions
- **Searchable**: Can query by content, user, date, trip

### **The Flow:**
```
User Types Message 
    ↓
Saves to Sanity Database (permanent storage)
    ↓  
Broadcasts via Socket.io (real-time delivery)
    ↓
Other User Receives Instantly
    ↓
Message Available in Chat History Forever
```

## 📱 **Accessing on Mobile**

Chat history works perfectly on mobile:
- Responsive design adapts to phone screens
- Touch-friendly conversation list
- Swipe gestures for navigation
- Same real-time features as desktop

---

## 🎯 **Quick Summary:**

**Your chat history is stored in:**
1. **Primary**: Sanity CMS cloud database (permanent)
2. **Access**: `/messages` page or individual trip chats
3. **Security**: Private to trip participants only
4. **Sync**: Real-time across all devices
5. **Backup**: Automatic cloud backups

**Try it now**: Go to `http://localhost:3001/messages` to see all your conversations!
