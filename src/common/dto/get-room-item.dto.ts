import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsOptional, IsString } from "class-validator";

export class GetRoomItemReturnDto {
  @ApiProperty({ description: '방 ID' })
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  short_id: string;

  @ApiProperty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsDate()
  created_at: Date;
}