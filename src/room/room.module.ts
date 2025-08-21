import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PostgresdbModule } from 'src/common/postgresdb/postgresdb.module';

@Module({
  imports: [PostgresdbModule],
  providers: [RoomService],
  controllers: [RoomController]
})
export class RoomModule {}