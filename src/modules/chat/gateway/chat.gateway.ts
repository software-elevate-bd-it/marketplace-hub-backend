import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { ChatService } from '../service/chat.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
})
@Injectable()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('WebSocket Server initialized');
  }

  handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    if (client.userId) {
      const userSockets = this.userSockets.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string },
  ) {
    client.userId = data.userId;

    // Track user's socket connections
    let userSockets = this.userSockets.get(data.userId);
    if (!userSockets) {
      userSockets = new Set<string>();
      this.userSockets.set(data.userId, userSockets);
    }
    userSockets.add(client.id);

    console.log(`User ${data.userId} authenticated with socket ${client.id}`);

    // Join user to their personal room
    client.join(`user:${data.userId}`);

    return { status: 'authenticated' };
  }

  @SubscribeMessage('join_thread')
  handleJoinThread(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = this.getAuthenticatedUserId(client);
    if (!userId) {
      return { status: 'error', message: 'Not authenticated' };
    }

    const threadRoom = `thread:${data.threadId}`;
    client.join(threadRoom);
    console.log(`User ${userId} joined thread ${data.threadId}`);

    // Notify others in the thread that user is online
    this.server.to(threadRoom).emit('user_online', {
      userId,
      threadId: data.threadId,
    });

    return { status: 'joined', threadId: data.threadId };
  }

  @SubscribeMessage('leave_thread')
  handleLeaveThread(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = this.getAuthenticatedUserId(client);
    if (!userId) {
      return { status: 'error', message: 'Not authenticated' };
    }

    const threadRoom = `thread:${data.threadId}`;
    client.leave(threadRoom);
    console.log(`User ${userId} left thread ${data.threadId}`);

    // Notify others in the thread that user is offline
    this.server.to(threadRoom).emit('user_offline', {
      userId,
      threadId: data.threadId,
    });

    return { status: 'left', threadId: data.threadId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { threadId: string; text: string; attachments?: string[] },
  ) {
    const userId = this.getAuthenticatedUserId(client);
    if (!userId) {
      return { status: 'error', message: 'Not authenticated' };
    }

    try {
      // Save message to database via service
      const message = await this.chatService.sendMessage(
        data.threadId,
        userId,
        {
          text: data.text,
          attachments: data.attachments,
        },
      );

      const threadRoom = `thread:${data.threadId}`;

      // Emit message to all users in the thread
      this.server.to(threadRoom).emit('new_message', {
        id: message.id.toString(),
        threadId: data.threadId,
        senderId: userId,
        text: message.text,
        attachments: message.attachments,
        createdAt: message.createdAt,
      });

      // Return confirmation to sender
      return {
        status: 'sent',
        messageId: message.id.toString(),
        createdAt: message.createdAt,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { threadId: string; isTyping: boolean },
  ) {
    const userId = this.getAuthenticatedUserId(client);
    if (!userId) {
      return { status: 'error', message: 'Not authenticated' };
    }

    const threadRoom = `thread:${data.threadId}`;

    this.server.to(threadRoom).emit('user_typing', {
      userId,
      threadId: data.threadId,
      isTyping: data.isTyping,
    });

    return { status: 'typing_broadcast' };
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = this.getAuthenticatedUserId(client);
    if (!userId) {
      return { status: 'error', message: 'Not authenticated' };
    }

    try {
      await this.chatService.markThreadAsRead(data.threadId, userId);

      const threadRoom = `thread:${data.threadId}`;
      this.server.to(threadRoom).emit('thread_read', {
        userId,
        threadId: data.threadId,
        readAt: new Date(),
      });

      return { status: 'marked_read' };
    } catch (error) {
      console.error('Error marking thread as read:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Helper method to send message to specific user
  private getAuthenticatedUserId(client: AuthenticatedSocket): string | null {
    if (!client.userId) {
      console.warn(`Socket ${client.id} attempted an action without authentication.`);
      return null;
    }
    return client.userId;
  }

  sendToUser(userId: string, event: string, data: any) {
    const userRoom = `user:${userId}`;
    this.server.to(userRoom).emit(event, data);
  }

  // Helper method to send message to thread
  sendToThread(threadId: string, event: string, data: any) {
    const threadRoom = `thread:${threadId}`;
    this.server.to(threadRoom).emit(event, data);
  }
}
