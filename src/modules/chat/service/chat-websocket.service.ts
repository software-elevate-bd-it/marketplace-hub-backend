import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ChatWebSocketService {
  extractUserFromSocket(socket: Socket): string {
    // Extract JWT from query params or auth header
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    // The token should be validated by a middleware
    // For now, we'll extract the userId from the socket data
    // This would typically come from JWT verification
    const userId = socket.handshake.auth.userId || socket.handshake.query.userId;

    if (!userId) {
      throw new UnauthorizedException('No user ID provided');
    }

    return userId;
  }

  // Helper to broadcast to all users in a thread
  broadcastToThread(io: any, threadId: string, event: string, data: any) {
    io.to(`thread:${threadId}`).emit(event, {
      ...data,
      timestamp: new Date(),
    });
  }

  // Helper to broadcast to specific user
  broadcastToUser(io: any, userId: string, event: string, data: any) {
    io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date(),
    });
  }

  // Validate if user has access to thread
  async validateUserThreadAccess(userId: string, threadId: string, chatService: any): Promise<boolean> {
    // This would check if the user is part of the thread
    // Implementation depends on your ChatService methods
    return true; // Placeholder
  }
}
