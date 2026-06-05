import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ChatService } from './service/chat.service';
import { SendMessageDto } from './dto/message.dto';

@ApiTags('Chat & Messaging')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('threads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List chat threads' })
  async getUserThreads(@CurrentUser() user: any) {
    return this.chatService.getUserThreads(user.id);
  }

  @Get('threads/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages in a thread' })
  async getThreadMessages(
    @Param('id') threadId: string,
    @Query('before') before?: string,
    @Query('limit') limit?: number,
  ) {
    const beforeDate = before ? new Date(before) : undefined;
    return this.chatService.getThreadMessages(threadId, beforeDate, limit || 50);
  }

  @Post('threads/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Param('id') threadId: string,
    @CurrentUser() user: any,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(threadId, user.id, sendMessageDto);
  }

  @Post('threads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get or create chat thread' })
  async getOrCreateThread(
    @CurrentUser() user: any,
    @Body() body: { participantId: string; listingId?: string },
  ) {
    return this.chatService.getOrCreateThread(user.id, body.participantId, body.listingId);
  }
}