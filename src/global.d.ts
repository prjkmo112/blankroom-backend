declare namespace NodeJS {
  interface ProcessEnv {
    COOKIE_AUTH_KEY_TOKEN: string;
    POSTGRES_URL: string;
    ENABLED_SWAGGER: string;
    SWAGGER_UI_URL: string;
    CORS_ORIGIN: string;
    JWT_SECRET: string;
  }
}

declare namespace Express {
  interface Request {
    user?: import('src/types/auth').JwtPayload;
    cookies: Record<string, string | undefined>;
  }
}