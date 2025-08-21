import { Request } from "express";

export interface JwtPayload {
  sub: string;
  id: string;
  nickname: string;
  exp?: number;
  iat?: number;
  createdAt: string | Date | null;
}