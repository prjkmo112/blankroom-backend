import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from 'src/types/auth';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);
    if (!token)
      throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        {
          secret: process.env.JWT_SECRET,
        }
      );

      request.user = payload;
    } catch (__err) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const token = request.cookies[process.env.COOKIE_AUTH_KEY_TOKEN] as string | undefined;
    return token;
  }
}