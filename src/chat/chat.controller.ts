import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMessageResponse } from '../common/dto/chat.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly chatService: ChatService
  ) {}

  @Get('history/:roomId')
  @ApiOperation({ summary: '채팅 기록 조회' })
  @ApiResponse({
    status: 200,
    description: '채팅 기록 조회 성공',
  })
  @ApiResponse({ status: 404, description: '방을 찾을 수 없음' })
  async getChatHistory(
    @Param('roomId') roomId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ChatMessageResponse[]> {
    return this.chatService.getChatHistory(roomId, page || 1, limit || 50);
  }

  @Get('recent/:roomId')
  @ApiOperation({ summary: '최근 채팅 메시지 조회' })
  @ApiResponse({
    status: 200,
    description: '최근 메시지 조회 성공',
  })
  @ApiResponse({ status: 404, description: '방을 찾을 수 없음' })
  async getRecentMessages(
    @Param('roomId') roomId: string,
    @Query('limit') limit?: number,
  ): Promise<ChatMessageResponse[]> {
    return this.chatService.getRecentMessages(roomId, limit || 10);
  }
}