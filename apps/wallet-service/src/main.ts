import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

const PROTO_PATH = join(__dirname, '../../../packages/proto/wallet.proto');

async function bootstrap() {
  console.log('PROTO_PATH', PROTO_PATH);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'wallet',
        protoPath: PROTO_PATH,
        url: process.env.WALLET_SERVICE_URL || '0.0.0.0:5002',
      },
    },
  );

  app.useLogger(app.get(Logger));
  await app.listen();
  console.log('Wallet Service is running on gRPC port 5002');
}

bootstrap();
