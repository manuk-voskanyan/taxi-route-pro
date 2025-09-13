# Message Storage Information

## 📧 Where Messages Are Stored

Your messages are stored in **Sanity CMS** - a powerful content management system that provides real-time data and reliable storage.

### 🗄️ **Storage Details:**

#### **Database**: Sanity CMS
- **Location**: Cloud-based (sanity.io)
- **Collection**: `message` documents
- **Real-time**: Yes - updates instantly across all devices
- **Persistence**: Permanent storage (messages don't disappear)
- **Backup**: Automatically backed up by Sanity

#### **Message Schema Structure:**
```javascript
{
  _type: 'message',
  _id: 'unique-message-id',
  
  // References
  trip: { reference to trip document },
  sender: { reference to user document },
  receiver: { reference to user document },
  
  // Content
  content: 'The actual message text',
  messageType: 'text' | 'booking_request' | 'booking_confirmation' | 'trip_update',
  
  // Metadata
  isRead: boolean,
  createdAt: timestamp,
  
  // Optional
  attachments: [array of images]
}
```

### 🔍 **How to Access Your Messages:**

#### **Option 1: Messages Page**
- Navigate to `/messages` in your browser
- View all conversations organized by trip
- Click any conversation to open the chat

#### **Option 2: From Trips Page**  
- Go to `/trips`
- Click "Կապվել վարորդի հետ" (Contact Driver) on any trip
- This opens the chat modal for that specific trip

#### **Option 3: Via Notifications**
- When you receive a new message, a notification appears
- Click the notification to go directly to messages page

### 🛠️ **Technical Access Points:**

#### **API Endpoints:**
- `GET /api/messages?tripId=xxx&userId=yyy` - Fetch messages
- `POST /api/messages` - Send new message  
- `PUT /api/messages` - Mark messages as read
- `GET /api/conversations` - Get all conversations

#### **Sanity Studio Access:**
If you have admin access, you can view messages in Sanity Studio:
- Go to your Sanity project dashboard
- Navigate to "Message" documents
- View, edit, or delete messages directly

### 🔒 **Security & Privacy:**

#### **Access Control:**
- Messages are only visible to participants (sender + receiver)
- Authentication required via NextAuth
- Trip-based isolation (each trip has its own conversation)

#### **Data Protection:**
- Messages stored securely in Sanity's cloud infrastructure
- HTTPS encryption for all data transmission
- No local storage of sensitive message content

### 📱 **Cross-Device Synchronization:**
- Messages sync instantly across all devices
- Real-time updates via Socket.io
- Persistent storage ensures messages survive:
  - Page refreshes
  - Browser restarts  
  - Device changes
  - Server restarts

### 🔧 **Troubleshooting:**

#### **If Messages Don't Load:**
1. Check authentication status
2. Verify internet connection
3. Check browser console for API errors
4. Ensure Sanity credentials are configured

#### **If Real-time Updates Stop:**
1. Check Socket.io connection (bottom-left status indicator)
2. Refresh the page to reconnect
3. Check browser console for WebSocket errors

### 📈 **Message Statistics:**
To view message analytics in Sanity:
1. Query total message count: `count(*[_type == "message"])`
2. Messages per user: Group by sender/receiver references
3. Most active trips: Group by trip reference
4. Message frequency: Analyze createdAt timestamps

### 🚀 **Future Enhancements:**
- Message search functionality
- File/image attachments
- Message reactions
- Push notifications
- Message encryption
- Export conversation history

---

**Need Help?** Check the debug panel (🐛 icon) in your app to see real-time message flow and troubleshoot any issues.
