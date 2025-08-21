import { Module } from '@nestjs/common';
import { PostgresdbService } from './postgresdb.service';

@Module({
  providers: [PostgresdbService],
  exports: [PostgresdbService],
})
export class PostgresdbModule {}