import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  async createThread(data: any) {
    return this.prisma.chatThread.create({ data });
  }

  async findThreadBetweenUsers(userId1: string, userId2: string) {
    return this.prisma.chatThread.findFirst({
      where: {
        OR: [
          { buyerId: BigInt(userId1), sellerId: BigInt(userId2) },
          { buyerId: BigInt(userId2), sellerId: BigInt(userId1) },
        ],
      },
    });
  }

  async findUserThreads(userId: string) {
    return this.prisma.chatThread.findMany({
      where: {
        OR: [
          { buyerId: BigInt(userId) },
          { sellerId: BigInt(userId) },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createMessage(data: any) {
    return this.prisma.message.create({ data });
  }

  async findMessages(threadId: string, before?: Date, limit: number = 50) {
    return this.prisma.message.findMany({
      where: {
        threadId: BigInt(threadId),
        ...(before && { createdAt: { lt: before } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markThreadAsRead(threadId: string, userId: string) {
    return this.prisma.chatThread.update({
      where: { id: BigInt(threadId) },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
