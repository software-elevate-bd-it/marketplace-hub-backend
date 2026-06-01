import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findThreads(userId: string) {
    const threads =
      await this.prisma.chatThread.findMany({
        where: {
          OR: [
            {
              buyerId: userId,
            },
            {
              sellerId: userId,
            },
          ],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return Promise.all(
      threads.map((thread) =>
        this.getThreadDetails(
          thread.id,
          userId,
        ),
      ),
    );
  }

  async findThreadById(
    id: string,
    userId: string,
  ) {
    return this.getThreadDetails(
      id,
      userId,
    );
  }

  async sendMessage(
    threadId: string,
    senderId: string,
    dto: SendMessageDto,
  ) {
    const thread =
      await this.prisma.chatThread.findUnique({
        where: {
          id: threadId,
        },
      });

    if (!thread) {
      throw new NotFoundException(
        'Thread not found',
      );
    }

    const message =
      await this.prisma.message.create({
        data: {
          threadId,
          senderId,
          text: dto.text,
        },
      });

    return {
      id: message.id,

      from:
        message.senderId === senderId
          ? 'me'
          : 'them',

      text: message.text,

      at: message.createdAt,
    };
  }

  async createThread(data: {
    buyerId: string;
    sellerId: string;
    listingId: string;
    listingTitle: string;
  }) {
    return this.prisma.chatThread.create({
      data,
    });
  }

  private async getThreadDetails(
    threadId: string,
    currentUserId: string,
  ) {
    const thread =
      await this.prisma.chatThread.findUnique({
        where: {
          id: threadId,
        },
      });

    if (!thread) {
      throw new NotFoundException(
        'Thread not found',
      );
    }

    const messages =
      await this.prisma.message.findMany({
        where: {
          threadId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

    const otherUserId =
      thread.buyerId === currentUserId
        ? thread.sellerId
        : thread.buyerId;

    return {
      id: thread.id,

      name: 'Unknown User',

      avatar:
        'https://dummyimage.com/200x200',

      listingTitle: thread.listingTitle,

      online: false,

      messages: messages.map((msg) => ({
        id: msg.id,

        from:
          msg.senderId === currentUserId
            ? 'me'
            : 'them',

        text: msg.text,

        at: msg.createdAt,
      })),

      otherUserId,
    };
  }
}