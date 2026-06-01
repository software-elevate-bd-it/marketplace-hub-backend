import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { ChatService } from './chat.service';

import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @Get('threads')
@UseGuards(JwtAuthGuard)
findThreads(
  @CurrentUser('id') userId: string,
) {
  return this.chatService.findThreads(
    userId,
  );
}

  @Get('threads/:id')
  findThread(
    @Param('id') id: string,
  ) {
    const userId = 'temp-user-id';

    return this.chatService.findThreadById(
      id,
      userId,
    );
  }

  @Post('threads/:id/messages')
  sendMessage(
    @Param('id') id: string,

    @Body()
    dto: SendMessageDto,
  ) {
    const senderId = 'temp-user-id';

    return this.chatService.sendMessage(
      id,
      senderId,
      dto,
    );
  }
}