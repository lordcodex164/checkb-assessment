import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { GrpcClientModule } from 'src/grpc/grpc-client.module';

@Module({
  imports: [GrpcClientModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
