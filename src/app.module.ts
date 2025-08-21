import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RoomModule } from './room/room.module';
import { BoardModule } from './board/board.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [RoomModule, BoardModule, ChatModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}