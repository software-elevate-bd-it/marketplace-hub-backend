import { Module } from '@nestjs/common';
import { ChatRepository } from './repository/chat.repository';
import { ChatService } from './service/chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateway/chat.gateway';

@Module({
  providers: [ChatRepository, ChatService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}