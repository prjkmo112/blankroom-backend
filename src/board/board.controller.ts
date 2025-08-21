import { Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { BoardService } from './board.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from 'src/common/dto/upload-file.dto';
import { GetBoardByRoomIdReturnType } from 'src/common/dto/get-board-by-roomid.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
  ) {}

  @ApiResponse({ type: GetBoardByRoomIdReturnType, description: 'Get board by roomId' })
  @Get(':roomId')
  @UseGuards(AuthGuard)
  async getBoard(
    @Param('roomId') roomId: string
  ) {
    const rows = await this.boardService.getBoard(roomId);
    return rows;
  }

  @ApiOperation({ summary: 'Canvas 이미지를 업로드하여 저장' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ type: Boolean, description: '업로드 성공 여부' })
  @Post(':roomId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upsertBoard(
    @Param('roomId') roomId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file)
      throw new Error('No file uploaded');

    const res = await this.boardService.upsertBoard(roomId, file.buffer);
    return !!res;
  }
}