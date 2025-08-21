import { Injectable } from '@nestjs/common';
import { PostgresdbService } from 'src/common/postgresdb/postgresdb.service';

@Injectable()
export class BoardService {
  constructor(
    private readonly postgresdbService: PostgresdbService
  ) {}

  async getBoard(roomId: string) {
    return this.postgresdbService.boards.findFirst({
      where: { room_id: roomId },
    });
  }

  async upsertBoard(roomId: string, imgData: Buffer) {
    return this.postgresdbService.boards.upsert({
      where: { room_id: roomId },
      update: {
        image_data: imgData
      },
      create: {
        room_id: roomId,
        image_data: imgData
      }
    });
  }
}