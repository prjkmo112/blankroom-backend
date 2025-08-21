import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { PostgresdbModule } from 'src/common/postgresdb/postgresdb.module';

@Module({
  imports: [PostgresdbModule],
  providers: [BoardService],
  controllers: [BoardController]
})
export class BoardModule {}