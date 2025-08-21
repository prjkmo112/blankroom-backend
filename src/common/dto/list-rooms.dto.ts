import { ApiProperty } from "@nestjs/swagger";
import { CreateRoomDto } from "./create-rooms.dto";
import { IsString } from "class-validator";

export class ListRoomsDto extends CreateRoomDto {
  @ApiProperty({ description: '방 짧은 ID (필수)' })
  @IsString()
  short_id: string;

  @ApiProperty({ description: '방 생성 시간 (필수)' })
  created_at: Date;
}