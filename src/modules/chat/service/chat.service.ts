import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../repository/chat.repository';
import { SendMessageDto } from '../dto/message.dto';

@Injectable()
export class ChatService {
  constructor(private chatRepository: ChatRepository) {}

  async sendMessage(threadId: string, senderId: string, sendMessageDto: SendMessageDto) {
    const message = await this.chatRepository.createMessage({
      threadId: BigInt(threadId),
      senderId: BigInt(senderId),
      text: sendMessageDto.text,
      attachments: sendMessageDto.attachments,
    });

    return message;
  }

  async getThreadMessages(threadId: string, before?: Date, limit: number = 50) {
    const messages = await this.chatRepository.findMessages(threadId, before, limit);
    return {
      data: messages,
      hasMore: messages.length === limit,
    };
  }

  async getUserThreads(userId: string) {
    const threads = await this.chatRepository.findUserThreads(userId);
    return threads;
  }

  async getOrCreateThread(userId1: string, userId2: string, listingId?: string) {
    const existingThread = await this.chatRepository.findThreadBetweenUsers(userId1, userId2);
    if (existingThread) {
      return existingThread;
    }

    return this.chatRepository.createThread({
      buyerId: BigInt(userId1),
      sellerId: BigInt(userId2),
      listingId: listingId ? BigInt(listingId) : BigInt(0),
      isRead: false,
      readAt: null,
    });
  }

  async markThreadAsRead(threadId: string, userId: string) {
    return this.chatRepository.markThreadAsRead(threadId, userId);
  }
}
