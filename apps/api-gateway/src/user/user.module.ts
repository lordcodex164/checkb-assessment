import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { UserController } from './user.controller';
import { UserGrpcService } from './user-grpc.service';
import { USER_SERVICE } from './user.constants';

const USER_PROTO_PATH = resolve(__dirname, '../../../../packages/proto/user.proto');

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: USER_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'user',
            protoPath: USER_PROTO_PATH,
            url: configService.get<string>(
              'USER_SERVICE_URL',
              'localhost:5001',
            ),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserGrpcService],
  exports: [UserGrpcService],
})
export class UserModule {}
