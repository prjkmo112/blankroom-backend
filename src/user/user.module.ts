import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PostgresdbModule } from 'src/common/postgresdb/postgresdb.module';

@Module({
  imports: [PostgresdbModule],
  providers: [UserService],
  exports: [UserService],
  controllers: []
})
export class UserModule {}