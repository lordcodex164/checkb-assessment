import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

const PROTO_PATH = join(__dirname, '../../../packages/proto/wallet.proto');

async function bootstrap() {
  console.log('PROTO_PATH', PROTO_PATH);
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'wallet',
      protoPath: PROTO_PATH,
      url: '0.0.0.0:5002',
    },
  });

  // 3. Start gRPC
  await app.startAllMicroservices();

  // 4. Start HTTP (this is what Render needs)
  const port = process.env.PORT || 3002;
  app.useLogger(app.get(Logger));
  await app.listen(port);

  console.log(`HTTP running on ${port}`);
  console.log(`gRPC running on 5002`);
  console.log('Wallet Service is running on gRPC port 5002');
}

bootstrap();
