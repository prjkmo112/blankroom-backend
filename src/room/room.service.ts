import { Injectable } from '@nestjs/common';
import { PostgresdbService } from 'src/common/postgresdb/postgresdb.service';
import { Prisma } from 'prisma/generated';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RoomService {
  private readonly saltRounds = 12;

  constructor(
    private readonly postgresdbService: PostgresdbService
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compareRoomPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async createRoom(data: Omit<Prisma.roomsCreateInput, 'id' | 'short_id'>) {
    const shortId = nanoid(10);
    let password = data.password?.trim();
    password ||= undefined;
    
    const hashedPassword = password ? await this.hashPassword(password) : undefined;
    
    const res = await this.postgresdbService.rooms.create({
      data: {
        ...data,
        short_id: shortId,
        password: hashedPassword,
      }
    });
    return !!res.id;
  }

  async getRoom(id?: string, shortId?: string) {
    return this.postgresdbService.rooms.findFirst({
      where: {
        ...(id ? { id } : {}),
        ...(shortId ? { short_id: shortId } : {})
      },
      select: {
        id: true,
        short_id: true,
        name: true,
        description: true,
        created_at: true,
        password: true
      }
    });
  }

  async validateRoomAccess(roomId: string, password?: string): Promise<boolean> {
    const room = await this.postgresdbService.rooms.findUnique({
      where: { id: roomId },
      select: { password: true }
    });

    if (!room) return false;
    if (!room.password) return true;
    if (!password) return false;
    
    return this.compareRoomPassword(password, room.password);
  }
}