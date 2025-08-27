import { Body, Controller, Get, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/common/dto/login.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RegisterDto } from 'src/common/dto/register.dto';
import type { Response } from 'express';
import { AuthStatusMsgRespSwagger } from 'src/common/decorators/auth-status-msg-resp-swagger.decorator';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @AuthStatusMsgRespSwagger({ bodyType: LoginDto, summary: 'User login' })
  @Post('login')
  async login(
    @Body() loginform: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token } = await this.authService.login(loginform.username, loginform.password);
    res.cookie(process.env.COOKIE_AUTH_KEY_TOKEN, access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000,
      path: '/',
    });
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile() {
    return;
  }

  @AuthStatusMsgRespSwagger({ successStatusCode: 201, bodyType: RegisterDto, summary: 'User registration' })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token } = await this.authService.register(registerDto);
    res.cookie(process.env.COOKIE_AUTH_KEY_TOKEN, access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000,
      path: '/',
    });
    return res.status(HttpStatus.CREATED).json({ message: 'ok' });
  }
}