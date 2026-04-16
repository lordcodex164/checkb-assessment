import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
const PROTO_PATH = join(__dirname, '../../../packages/proto/user.proto');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const listenUrl = process.env.USER_SERVICE_URL ?? '0.0.0.0:5001';

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: PROTO_PATH,
      url: listenUrl,
    },
  });

  await app.startAllMicroservices();

  const logger = app.get(Logger);
  logger.log(
    `user-service gRPC ready | bind=${listenUrl} | proto=${PROTO_PATH} | NODE_ENV=${process.env.NODE_ENV ?? 'undefined'}`,
  );
}

bootstrap();
