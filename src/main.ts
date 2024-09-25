import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Starting server...');
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log(`Server is running on http://localhost:3000`);
}

bootstrap().catch(err => {
  console.error('Error starting server:', err);
});