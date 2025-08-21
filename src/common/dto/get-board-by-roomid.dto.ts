import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDate } from "class-validator";

export class GetBoardByRoomIdReturnType {
  @ApiProperty()
  @IsString()
  room_id: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  image_data: string;

  @ApiProperty()
  @IsDate()
  created_at: Date;

  @ApiProperty()
  @IsDate()
  updated_at: Date;
}