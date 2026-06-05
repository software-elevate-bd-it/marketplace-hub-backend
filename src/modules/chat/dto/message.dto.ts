import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Hello, is this item still available?' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: ['attachment_url1', 'attachment_url2'] })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  from: string;

  @ApiProperty()
  text: string;

  @ApiPropertyOptional()
  attachments?: string[];

  @ApiProperty()
  createdAt: Date;
}

export class ChatThreadResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  participant: {
    id: string;
    name: string;
  };

  @ApiProperty()
  lastMessage: string;

  @ApiProperty()
  unread: number;

  @ApiProperty()
  updatedAt: Date;
}
