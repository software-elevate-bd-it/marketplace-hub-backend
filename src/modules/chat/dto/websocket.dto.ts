import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebSocketAuthDto {
  @ApiProperty({ example: '123' })
  @IsString()
  userId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  token?: string;
}

export class JoinThreadDto {
  @ApiProperty({ example: '456' })
  @IsString()
  threadId: string;
}

export class SendWebSocketMessageDto {
  @ApiProperty({ example: '456' })
  @IsString()
  threadId: string;

  @ApiProperty({ example: 'Hello! Is this item still available?' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: ['url1', 'url2'] })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class TypingDto {
  @ApiProperty({ example: '456' })
  @IsString()
  threadId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isTyping: boolean;
}

export class WebSocketMessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  threadId: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  text: string;

  @ApiPropertyOptional()
  attachments?: string[];

  @ApiProperty()
  createdAt: Date;
}

export class OnlineStatusDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  threadId: string;

  @ApiProperty()
  isOnline: boolean;

  @ApiProperty()
  timestamp: Date;
}
