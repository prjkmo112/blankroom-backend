import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PostgresdbService } from '../common/postgresdb/postgresdb.service';
import { ChatMessageResponse } from '../common/dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PostgresdbService
  ) {}

  async saveMessage(id: string, roomId: string, message: string): Promise<ChatMessageResponse> {
    try {
      const sanitizedMessage = Buffer.from(message, 'utf8').toString('utf8');

      const room = await this.prisma.rooms.findUnique({
        where: { id: roomId },
      });

      if (!room)
        throw new NotFoundException('Room not found.');

      const user = await this.prisma.users.findUnique({
        where: { id: id },
      });

      if (!user)
        throw new NotFoundException('User not found.');

      const chatMessage = await this.prisma.chat_messages.create({
        data: {
          user_id: id,
          room_id: roomId,
          message: sanitizedMessage,
        },
        include: {
          users: {
            select: {
              nickname: true,
            },
          },
        },
      });

      return {
        id: chatMessage.id,
        message: Buffer.from(chatMessage.message, 'utf8').toString('utf8'),
        userId: chatMessage.user_id,
        nickname: Buffer.from(chatMessage.users.nickname, 'utf8').toString('utf8'),
        roomId: chatMessage.room_id,
        createdAt: chatMessage.created_at || new Date(),
      };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw error;
      throw new BadRequestException('Failed to save message.');
    }
  }

  async getChatHistory(roomId: string, page: number = 1, limit: number = 50): Promise<ChatMessageResponse[]> {
    try {
      const room = await this.prisma.rooms.findUnique({
        where: { id: roomId },
      });

      if (!room)
        throw new NotFoundException('Room not found.');

      const skip = (page - 1) * limit;

      const messages = await this.prisma.chat_messages.findMany({
        where: {
          room_id: roomId,
        },
        include: {
          users: {
            select: {
              nickname: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: skip,
        take: limit,
      });

      return messages.map((msg) => ({
        id: msg.id,
        message: Buffer.from(msg.message, 'utf8').toString('utf8'),
        userId: msg.user_id,
        nickname: Buffer.from(msg.users.nickname, 'utf8').toString('utf8'),
        roomId: msg.room_id,
        createdAt: msg.created_at || new Date(),
      })).reverse();
    } catch (error) {
      if (error instanceof NotFoundException)
        throw error;
      throw new BadRequestException('Failed to get chat history.');
    }
  }

  async getRecentMessages(roomId: string, limit: number = 10): Promise<ChatMessageResponse[]> {
    return this.getChatHistory(roomId, 1, limit);
  }
}