import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(__dirname, '../../../packages/proto/user.proto'),
        url: process.env.USER_SERVICE_URL || '0.0.0.0:5001',
      },
    },
  );

  app.useLogger(app.get(Logger));
  await app.listen();
  console.log('User Service is running on gRPC port 5001');
}

bootstrap();
