import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

const PROTO_PATH = join(__dirname, '../../../packages/proto/user.proto');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: PROTO_PATH,
      url: process.env.USER_SERVICE_URL || '0.0.0.0:5001',
    },
  });

  // 3. Start gRPC
  await app.startAllMicroservices();

  // 4. Start HTTP (this is what Render needs)
  const port = process.env.PORT || 5001;
  app.useLogger(app.get(Logger));
  await app.listen(port);

  console.log(`HTTP running on ${port}`);
  console.log(`gRPC running on 5001`);
  console.log('User Service is running on gRPC port 5001');
}

bootstrap();
