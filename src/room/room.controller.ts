import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateRoomDto } from 'src/common/dto/create-rooms.dto';
import { ListRoomsDto } from 'src/common/dto/list-rooms.dto';
import { PostgresdbService } from 'src/common/postgresdb/postgresdb.service';
import { GetRoomItemReturnDto } from 'src/common/dto/get-room-item.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('api/room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly postgresdbService: PostgresdbService
  ) {}

  @ApiResponse({ type: [ListRoomsDto] })
  @Get('list')
  @UseGuards(AuthGuard)
  async listRooms() {
    const rows = await this.postgresdbService.rooms.findMany({
      select: {
        short_id: true,
        name: true,
        description: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }
    });
    return rows;
  }

  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'short_id', required: false })
  @ApiQuery({ name: 'password', required: false })
  @ApiResponse({ type: GetRoomItemReturnDto })
  @Get('get')
  @UseGuards(AuthGuard)
  async getRoom(
    @Query('id') id?: string,
    @Query('short_id') shortId?: string,
    @Query('password') password?: string
  ) {
    if (!id && !shortId)
      throw new Error('Either id or short_id must be provided');

    const room = await this.roomService.getRoom(id, shortId);
    if (!room) return null;

    const hasPassword = !!room.password;

    if (hasPassword && !password) {
      return {
        ...room,
        password: undefined,
      };
    }

    if (hasPassword && password) {
      const valid = await this.roomService.validateRoomAccess(room.id, password);
      if (valid) {
        return {
          ...room,
          password: undefined,
        };
      }
    }

    return {
      ...room,
      password: undefined,
    };
  }

  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ type: Boolean })
  @Post('create')
  @UseGuards(AuthGuard)
  async createRoom(
    @Body() body: CreateRoomDto,
  ) {
    const res = await this.roomService.createRoom(body);
    return res;
  }
}