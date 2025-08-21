import { Injectable } from '@nestjs/common';
import { PostgresdbService } from 'src/common/postgresdb/postgresdb.service';
import { RegisterDto } from 'src/common/dto/register.dto';


interface checkDuplicateUserParams {
  userid?: string;
  nickname?: string;
}

@Injectable()
export class UserService {
  constructor(
    private readonly postgresdbService: PostgresdbService
  ) {}

  async getUser(userid: string) {
    return this.postgresdbService.users.findFirst({
      where: { userid },
    });
  }

  async checkDuplicateUser(params: checkDuplicateUserParams) {
    const user = await this.postgresdbService.users.findFirst({
      where: { OR: [{ userid: params.userid }, { nickname: params.nickname }] },
    });

    return user;
  }

  async createUser(data: RegisterDto) {
    return this.postgresdbService.users.create({
      data: {
        userid: data.id,
        password: data.password,
        nickname: data.nickname,
        created_at: new Date(),
      }
    });
  }
}