import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "src/types/auth";

export const CurrentUser = createParamDecorator(
  (_:unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  }
);