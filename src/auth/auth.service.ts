import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from 'src/types/auth';
import { RegisterDto } from 'src/common/dto/register.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async login(userid: string, pass: string) {
    const user = await this.userService.getUser(userid);

    if (!user || !(await this.comparePassword(pass, user.password)))
      throw new UnauthorizedException();

    const payload: JwtPayload = { sub: user.id, id: user.userid, nickname: user.nickname, createdAt: user.created_at };
    return {
      access_token: await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET })
    };
  }

  async register(data: RegisterDto) {
    const exist = await this.userService.checkDuplicateUser({
      userid: data.id,
      nickname: data.nickname
    });
    if (exist?.userid === data.id)
      throw new ConflictException('User already exists');
    else if (exist?.nickname === data.nickname)
      throw new ConflictException('Nickname already exists');

    const hashedPw = await this.hashPassword(data.password);

    const user = await this.userService.createUser({
      id: data.id,
      password: hashedPw,
      nickname: data.nickname
    });

    const payload: JwtPayload = { sub: user.id, id: user.userid, nickname: user.nickname, createdAt: user.created_at };
    return {
      access_token: await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET })
    };
  }
}