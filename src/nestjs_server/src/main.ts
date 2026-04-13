import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // Allow Angular to connect to the server
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Check and fix data automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Delete unknown data
      forbidNonWhitelisted: true, // Block bad data
      transform: true, // Convert text to numbers
    }),
  );

  // Listen on port 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Log status messages
  const logger = new Logger('Bootstrap');
  logger.log(
    `🌐 WebSocket server is running and listening on ws://localhost:${port}`,
  );
}
bootstrap();
