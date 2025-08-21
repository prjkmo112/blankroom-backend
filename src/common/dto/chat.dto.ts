import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Chat message content',
    example: 'Hello!',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @ApiProperty({
    description: 'Room ID',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class JoinRoomDto {
  @ApiProperty({
    description: 'Room ID to join',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'Room password (optional)',
    example: 'secretpassword',
    required: false,
  })
  password?: string;
}

export class LeaveRoomDto {
  @ApiProperty({
    description: 'Room ID to leave',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class GetChatHistoryDto {
  @ApiProperty({
    description: 'Room ID',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'Page number (optional)',
    example: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: 'Number of messages per page (optional)',
    example: 50,
    required: false,
  })
  limit?: number;
}

export interface ChatMessageResponse {
  id: string;
  message: string;
  userId: string;
  nickname: string;
  roomId: string;
  createdAt: Date;
}

export interface SystemMessage {
  message: string;
  type: 'info' | 'error' | 'join' | 'leave' | 'create';
}