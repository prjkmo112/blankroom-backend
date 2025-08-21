import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class UserJwtDto {
  @ApiProperty()
  @IsString()
  sub: string;

  @ApiProperty()
  @IsString()
  nickname: string;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  iat?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  exp?: number;
}