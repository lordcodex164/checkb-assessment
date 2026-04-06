import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { join } from 'path';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'user', //setup a user service
        protoPath: join(__dirname, '../../packages/proto/user.proto'),
        url: '0.0.0.0.3001',
      },
    },
  );
  app.useLogger(app.get(Logger));
  await app.listen();
  console.log('app running on port 3001');
}
bootstrap();
