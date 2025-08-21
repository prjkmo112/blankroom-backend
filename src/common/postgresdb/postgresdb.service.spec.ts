import { Test, TestingModule } from '@nestjs/testing';
import { PostgresdbService } from './postgresdb.service';

describe('PostgresdbService', () => {
  let service: PostgresdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostgresdbService],
    }).compile();

    service = module.get<PostgresdbService>(PostgresdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});