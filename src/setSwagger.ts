import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from "@nestjs/swagger";


const SwaggerBuilder = new DocumentBuilder()
  .setTitle('Blankroom API')
  .setDescription('The Blankroom API description')
  .setVersion('0.1.0')
  .build();

const CustomSwaggerOptions:SwaggerCustomOptions = {
  explorer: true,
};

export function setSwagger(app:INestApplication<any>) {
  const doc = SwaggerModule.createDocument(app, SwaggerBuilder);
  SwaggerModule.setup(process.env.SWAGGER_UI_URL, app, doc, CustomSwaggerOptions);
}