import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { resolve } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const USER_SERVICE = 'USER_SERVICE';
const USER_PROTO_PATH = resolve(
  __dirname,
  '../../../../packages/proto/user.proto',
);

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
  exports: [ClientsModule],
})
export class GrpcClientModule {}
