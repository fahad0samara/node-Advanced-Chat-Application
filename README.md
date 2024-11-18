# Advanced Express Chat Application

A feature-rich real-time chat application built with Express.js, Socket.IO, and MongoDB.

## Features

### Authentication & Security
- Email/password registration with verification
- OAuth integration (Google, Facebook)
- JWT-based session management
- Role-based access control (Admin, Moderator, User)
- Rate limiting and CSRF protection
- Password hashing and secure session handling

### Real-time Communication
- WebSocket-based instant messaging
- Private and group chats
- Typing indicators
- Online status and last seen
- Read receipts
- Message reactions

### Message Features
- Rich text formatting with Markdown support
- Emoji support
- @mentions
- File attachments (images, documents, etc.)
- Message editing and deletion
- Reply threading
- Message search

### User Features
- Customizable profiles with avatars
- User status management
- Contact blocking
- User search
- Activity tracking

### Additional Features
- Redis-based caching
- AWS S3 file storage
- Comprehensive logging
- Input validation
- Error handling
- API documentation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Caching**: Redis
- **Storage**: AWS S3
- **Authentication**: Passport.js, JWT
- **Security**: helmet, cors, rate-limiting
- **Validation**: express-validator
- **Logging**: Winston

## Prerequisites

- Node.js (v16+)
- MongoDB
- Redis
- AWS Account (for file storage)
- Google OAuth credentials
- Facebook OAuth credentials
- SMTP server access

## Environment Variables

Create a `.env` file with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the server: `npm run dev`

## API Documentation

See [USAGE.md](USAGE.md) for detailed API documentation and usage instructions.

