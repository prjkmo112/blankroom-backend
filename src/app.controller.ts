import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(
    @Res() res: Response
  ) {
    return res.redirect(process.env.SWAGGER_UI_URL || '/swagger-ui');
  }
}