import { NestFactory } from '@nestjs/core';
import helmet, { HelmetOptions } from 'helmet';
import { AppModule } from './app.module';
import { setSwagger } from './setSwagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';


const baseHelmetOptions: Readonly<HelmetOptions> = {
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet(baseHelmetOptions));
  app.use(cookieParser());

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN.split(",").map((v) => v.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // swagger
  if (process.env.ENABLED_SWAGGER === 'true')
    setSwagger(app);

  await app.listen(3000);
}
void bootstrap();