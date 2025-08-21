import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto, JoinRoomDto, LeaveRoomDto, SystemMessage } from '../common/dto/chat.dto';
import { JwtPayload } from 'src/types/auth';


interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    userid: string;
    nickname: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  private extractTokenFromCookies(client: AuthenticatedSocket): string | undefined {
    const cookies = client.handshake.headers.cookie;
    if (!cookies) return undefined;

    const cookieArray = cookies.split(';').map(cookie => cookie.trim());
    const authCookieName = process.env.COOKIE_AUTH_KEY_TOKEN;

    if (!authCookieName) return undefined;

    for (const cookie of cookieArray) {
      const [name, value] = cookie.split('=');
      if (name === authCookieName)
        return value;
    }
    return undefined;
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id} (${client.handshake.address})`);

    try {
      const token = this.extractTokenFromCookies(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without valid token`);
        client.emit('error', { message: 'Authentication required.' });
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      client.user = {
        id: payload.sub,
        userid: payload.id,
        nickname: payload.nickname,
      };

      this.logger.log(`User (${payload.nickname}) authenticated via WebSocket`);

      client.emit('systemMessage', {
        message: "Connected to chat server!",
        type: "info"
      } as SystemMessage);
    } catch (error) {
      this.logger.warn(`Client ${client.id} authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      client.emit('error', { message: 'Authentication failed.' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id} (${client.handshake.address})`);

    if (client.user) {
      client.rooms.forEach(room => {
        if (room !== client.id) {
          client.to(room).emit('systemMessage', {
            message: `${client.user?.nickname} left the chat room.`,
            type: "leave"
          } as SystemMessage);
        }
      });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.user) {
        client.emit('error', { message: 'Authentication required.' });
        return;
      }

      await client.join(data.roomId);

      client.to(data.roomId).emit('systemMessage', {
        message: `${client.user.nickname} joined the chat room.`,
        type: "join"
      } as SystemMessage);

      const recentMessages = await this.chatService.getRecentMessages(data.roomId, 20);
      client.emit('chatHistory', recentMessages);

      this.logger.log(`User ${client.user.userid} joined room ${data.roomId}`);
    } catch (error) {
      client.emit('error', { message: 'Failed to join room.' });
      this.logger.error(`Failed to join room: ${error}`);
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: LeaveRoomDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.user) {
        client.emit('error', { message: 'Authentication required.' });
        return;
      }

      await client.leave(data.roomId);

      client.to(data.roomId).emit('systemMessage', {
        message: `${client.user.nickname} left the chat room.`,
        type: "leave"
      } as SystemMessage);

      this.logger.log(`User ${client.user.userid} left room ${data.roomId}`);
    } catch (error) {
      client.emit('error', { message: 'Failed to leave room.' });
      this.logger.error(`Failed to leave room: ${error}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.user) {
        client.emit('error', { message: 'Authentication required.' });
        return;
      }

      const savedMessage = await this.chatService.saveMessage(
        client.user.id,
        data.roomId,
        data.message
      );

      this.server.to(data.roomId).emit('newMessage', savedMessage);

      this.logger.log(`Message sent by ${client.user.userid} in room ${data.roomId}`);
    } catch (error) {
      client.emit('error', { message: 'Failed to send message.' });
      this.logger.error(`Failed to send message: ${error}`);
    }
  }

  @SubscribeMessage('getChatHistory')
  async handleGetChatHistory(
    @MessageBody() data: { roomId: string; page?: number; limit?: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.user) {
        client.emit('error', { message: 'Authentication required.' });
        return;
      }

      const messages = await this.chatService.getChatHistory(
        data.roomId,
        data.page || 1,
        data.limit || 50
      );

      client.emit('chatHistory', messages);
    } catch (error) {
      client.emit('error', { message: 'Failed to get chat history.' });
      this.logger.error(`Failed to get chat history: ${error}`);
    }
  }
}