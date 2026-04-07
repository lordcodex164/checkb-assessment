import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WALLET_PROTO_PATH } from '../grpc-proto.paths';
import { WalletController } from './wallet.controller';
import { WalletGrpcService } from './wallet-grpc.service';
import { WALLET_SERVICE } from './wallet.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: WALLET_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'wallet',
            protoPath: WALLET_PROTO_PATH,
            url: configService.get<string>(
              'WALLET_SERVICE_URL',
              'localhost:5002',
            ),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletGrpcService],
  exports: [WalletGrpcService],
})
export class WalletModule { }
