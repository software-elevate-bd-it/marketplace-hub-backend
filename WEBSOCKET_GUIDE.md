# WebSocket Chat Implementation Guide

## Overview
The Chat module now supports real-time communication using WebSocket (Socket.io). This enables instant message delivery, typing indicators, and online status updates without polling.

## Features
- **Real-time messaging**: Messages are instantly delivered to all participants in a thread
- **Typing indicators**: Users can see when others are typing
- **Online status**: Track when users join/leave threads
- **Message persistence**: All messages are saved to the database
- **Thread management**: Join/leave specific chat threads
- **User authentication**: Socket connections are tied to authenticated users

## WebSocket Events

### Client → Server Events

#### 1. `authenticate`
Authenticate the socket connection with a user ID.

**Payload:**
```json
{
  "userId": "user_id_string"
}
```

**Response:**
```json
{
  "status": "authenticated"
}
```

#### 2. `join_thread`
Join a specific chat thread to receive messages in real-time.

**Payload:**
```json
{
  "threadId": "thread_id_string"
}
```

**Response:**
```json
{
  "status": "joined",
  "threadId": "thread_id_string"
}
```

#### 3. `leave_thread`
Leave a chat thread.

**Payload:**
```json
{
  "threadId": "thread_id_string"
}
```

**Response:**
```json
{
  "status": "left",
  "threadId": "thread_id_string"
}
```

#### 4. `send_message`
Send a message to a thread.

**Payload:**
```json
{
  "threadId": "thread_id_string",
  "text": "Hello, is this item available?",
  "attachments": ["url1", "url2"]
}
```

**Response:**
```json
{
  "status": "sent",
  "messageId": "message_id_string",
  "createdAt": "2024-06-02T10:30:00Z"
}
```

#### 5. `typing`
Indicate that the user is typing.

**Payload:**
```json
{
  "threadId": "thread_id_string",
  "isTyping": true
}
```

**Response:**
```json
{
  "status": "typing_broadcast"
}
```

#### 6. `mark_read`
Mark a thread as read.

**Payload:**
```json
{
  "threadId": "thread_id_string"
}
```

**Response:**
```json
{
  "status": "marked_read"
}
```

### Server → Client Events

#### 1. `new_message`
Emitted to all users in a thread when a message is sent.

**Data:**
```json
{
  "id": "message_id_string",
  "threadId": "thread_id_string",
  "senderId": "user_id_string",
  "text": "Hello!",
  "attachments": ["url1"],
  "createdAt": "2024-06-02T10:30:00Z"
}
```

#### 2. `user_online`
Emitted when a user joins a thread.

**Data:**
```json
{
  "userId": "user_id_string",
  "threadId": "thread_id_string"
}
```

#### 3. `user_offline`
Emitted when a user leaves a thread.

**Data:**
```json
{
  "userId": "user_id_string",
  "threadId": "thread_id_string"
}
```

#### 4. `user_typing`
Emitted to all users in a thread when someone is typing.

**Data:**
```json
{
  "userId": "user_id_string",
  "threadId": "thread_id_string",
  "isTyping": true
}
```

#### 5. `thread_read`
Emitted when a thread is marked as read.

**Data:**
```json
{
  "userId": "user_id_string",
  "threadId": "thread_id_string",
  "readAt": "2024-06-02T10:30:00Z"
}
```

## Client Implementation Example

### Using Socket.IO JavaScript Client

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    userId: 'user123',
  },
  transports: ['websocket', 'polling'],
});

// Connect and authenticate
socket.on('connect', () => {
  socket.emit('authenticate', { userId: 'user123' });
});

// Join a chat thread
socket.emit('join_thread', { threadId: 'thread456' });

// Listen for new messages
socket.on('new_message', (data) => {
  console.log('New message:', data);
  // Update UI with new message
});

// Send a message
socket.emit('send_message', {
  threadId: 'thread456',
  text: 'Hello there!',
  attachments: [],
});

// Send typing indicator
socket.emit('typing', {
  threadId: 'thread456',
  isTyping: true,
});

// Listen for typing indicators
socket.on('user_typing', (data) => {
  console.log(`${data.userId} is typing: ${data.isTyping}`);
});

// Listen for online status
socket.on('user_online', (data) => {
  console.log(`${data.userId} is online in thread ${data.threadId}`);
});

socket.on('user_offline', (data) => {
  console.log(`${data.userId} is offline`);
});

// Mark thread as read
socket.emit('mark_read', { threadId: 'thread456' });

// Listen for thread read confirmation
socket.on('thread_read', (data) => {
  console.log(`Thread read by ${data.userId} at ${data.readAt}`);
});

// Disconnect
socket.disconnect();
```

## REST API (Existing)

The REST endpoints still work for non-real-time operations:

- `GET /chat/threads` - Get user's chat threads
- `GET /chat/threads/:id/messages` - Get messages in a thread
- `POST /chat/threads` - Create or get thread
- `POST /chat/threads/:id/messages` - Send a message (non-WebSocket)

## Installation

Dependencies have been added to `package.json`:
- `@nestjs/websockets`: ^11.0.1
- `socket.io`: ^4.8.1

Install them with:
```bash
npm install
```

## Configuration

### Enabled in Production
WebSocket is enabled with CORS support allowing all origins. For production, configure CORS appropriately:

```typescript
@WebSocketGateway({
  cors: {
    origin: ['https://yourdomain.com'],
    methods: ['GET', 'POST'],
  },
})
```

### Transports
Both `websocket` and `polling` transports are enabled for better compatibility.

## Rooms and Namespacing

The implementation uses Socket.IO rooms for efficient broadcasting:
- **User rooms**: `user:${userId}` - For user-specific notifications
- **Thread rooms**: `thread:${threadId}` - For thread-specific messages

## Database Integration

All messages sent through WebSocket are persisted to the database using the existing `ChatRepository`. This ensures messages are permanent and can be retrieved via REST API.

## Next Steps

1. Update your frontend to use WebSocket for real-time chat
2. Implement the Socket.IO client library in your UI
3. Test connection handling and reconnection logic
4. Monitor WebSocket connections in production
5. Configure CORS and authentication as needed

## Troubleshooting

### Connection Issues
- Check CORS configuration
- Verify socket.io client is using correct URL and port
- Ensure firewall allows WebSocket connections

### Message Not Delivered
- Verify user is authenticated with correct userId
- Confirm user is in the thread room (`join_thread`)
- Check database for message persistence

### Typing Indicator Not Working
- Ensure `isTyping` is being toggled correctly
- Verify user is in thread room before emitting

## Performance Considerations

- WebSocket connections are kept alive but limited by server resources
- Message broadcasts use room-based delivery (efficient)
- Consider implementing message queuing for high-volume scenarios
- Monitor active socket connections in production
