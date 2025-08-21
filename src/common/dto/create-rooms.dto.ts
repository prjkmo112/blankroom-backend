import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Matches, IsNotEmpty } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: '방 이름 (필수)' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '방 설명 (선택)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '숫자 6자리 비밀번호 (선택)' })
  @IsOptional()
  @IsString()
  @Matches(/^(?:\d{6})?$/)
  password?: string;
}