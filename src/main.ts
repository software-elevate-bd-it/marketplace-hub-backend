import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SuccessResponse } from './common/dto/response.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation

    // src/main.ts
const config = new DocumentBuilder()
  .setTitle('Marketplace API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
    },
    'Authorization',
  )
  .build();

const document = SwaggerModule.createDocument(app, config, {
  extraModels: [SuccessResponse],
});

SwaggerModule.setup('api', app, document);


// main.ts
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ Server running on http://localhost:${port}/api`);
}

bootstrap();
