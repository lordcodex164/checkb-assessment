import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { WALLET_SERVICE } from './wallet.constants';
import type { WalletServiceGrpc } from './interfaces/wallet-service.grpc';
import type { WalletResponse } from './interfaces/wallet-response.interface';
import type { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletGrpcService implements OnModuleInit {
  private walletService: WalletServiceGrpc;

  constructor(@Inject(WALLET_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.walletService =
      this.client.getService<WalletServiceGrpc>('WalletService');
  }

  createWallet(dto: CreateWalletDto): Promise<WalletResponse> {
    return lastValueFrom(this.walletService.createWallet(dto));
  }

  getWalletByUserId(userId: string): Promise<WalletResponse> {
    return lastValueFrom(this.walletService.getWallet({ userId }));
  }

  creditWallet(userId: string, amount: number): Promise<WalletResponse> {
    return lastValueFrom(
      this.walletService.creditWallet({ userId, amount }),
    );
  }

  debitWallet(userId: string, amount: number): Promise<WalletResponse> {
    return lastValueFrom(this.walletService.debitWallet({ userId, amount }));
  }
}
