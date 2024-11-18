# Usage Guide

## API Endpoints

### Authentication

```
POST /api/auth/register
- Register new user
- Body: { email, password, name }

POST /api/auth/login
- Login user
- Body: { email, password }

GET /api/auth/google
- Google OAuth login

GET /api/auth/facebook
- Facebook OAuth login
```

### Users

```
GET /api/users/profile
- Get current user profile
- Auth required

PATCH /api/users/profile
- Update user profile
- Auth required
- Body: { name?, bio?, avatar? }

GET /api/users
- Get all users (admin only)
- Auth required
```

### Chats

```
GET /api/chats
- Get user's chats
- Auth required

POST /api/chats
- Create new chat
- Auth required
- Body: { type: 'private'|'group', name?, participants[] }

GET /api/chats/:chatId/messages
- Get chat messages
- Auth required
- Query: { before?, limit? }
```

### Messages

```
POST /api/messages
- Send message
- Auth required
- Body: { chatId, content: { text }, attachments?, replyTo? }

PATCH /api/messages/:messageId
- Edit message
- Auth required
- Body: { content: { text } }

DELETE /api/messages/:messageId
- Delete message
- Auth required
```

### Search

```
GET /api/search
- Global search
- Auth required
- Query: { q, type?, chatId?, fromDate?, toDate?, hasAttachments?, fromUser? }
```

## WebSocket Events

### Client -> Server

```
connection
- Connect to WebSocket
- Auth token required

message
- Send new message
- Data: { chatId, content, attachments?, replyTo? }

typing-start
- Indicate user started typing
- Data: { chatId }

message-read
- Mark message as read
- Data: { messageId, chatId }

message-reaction
- Add/update message reaction
- Data: { messageId, emoji }
```

### Server -> Client

```
new-message
- New message received
- Data: { message }

message-delivered
- Message delivery status
- Data: { messageId, chatId }

user-typing
- User typing indicator
- Data: { userId, chatId, isTyping }

receipt-updated
- Read receipt update
- Data: { messageId, userId, status }

reaction-updated
- Message reaction update
- Data: { messageId, reactions }

user-offline
- User went offline
- Data: { userId, lastSeen }

online-users
- List of online users
- Data: userId[]
```

## Data Models

### User

```javascript
{
  email: String,
  password: String,
  name: String,
  role: 'user'|'moderator'|'admin',
  avatar: {
    url: String,
    thumbnailUrl: String
  },
  bio: String,
  isVerified: Boolean,
  status: 'online'|'offline'|'away',
  lastSeen: Date,
  settings: {
    notifications: {
      email: Boolean,
      push: Boolean
    },
    privacy: {
      showLastSeen: Boolean,
      showReadReceipts: Boolean
    }
  }
}
```

### Chat

```javascript
{
  type: 'private'|'group',
  name: String,
  participants: [User],
  admins: [User],
  lastMessage: Message
}
```

### Message

```javascript
{
  chat: Chat,
  sender: User,
  content: {
    text: String,
    formattedText: String,
    mentions: [{
      user: User,
      index: Number
    }]
  },
  attachments: [{
    type: 'image'|'video'|'audio'|'document',
    url: String,
    thumbnailUrl: String,
    filename: String,
    mimetype: String,
    size: Number
  }],
  readBy: [{
    user: User,
    readAt: Date
  }],
  replyTo: Message,
  reactions: [{
    user: User,
    emoji: String
  }],
  isEdited: Boolean,
  isDeleted: Boolean,
  deliveryStatus: 'sent'|'delivered'|'read'
}
```

## Logging

The application uses Winston for logging with two main log files:

### error.log
- Severity: ERROR
- Contains all error-level logs
- Stack traces
- Database connection issues
- Authentication failures
- API errors

### combined.log
- Severity: INFO and above
- Server start/stop events
- Successful connections
- API access logs
- User actions
- System events

Log Format:
```javascript
{
  "level": "info|error",
  "message": "Log message",
  "timestamp": "ISO date",
  "additional": "contextual data"
}
```

## Error Handling

The application includes centralized error handling:

- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

Error Response Format:
```javascript
{
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```