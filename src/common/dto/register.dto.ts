import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣0-9-_]{6,20}$/)
  id: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[a-zA-Z0-9!@#$-_]{5,20}$/)
  password: string;
}