import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { WALLET_SERVICE } from './wallet.constants';
import type { WalletServiceGrpc } from './interfaces/wallet-service.grpc';
import type { WalletResponse } from './interfaces/wallet-response.interface';
import type { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletGrpcService implements OnModuleInit {
  private readonly logger = new Logger(WalletGrpcService.name);
  private walletService: WalletServiceGrpc;

  constructor(@Inject(WALLET_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.walletService =
      this.client.getService<WalletServiceGrpc>('WalletService');
  }

  async createWallet(dto: CreateWalletDto): Promise<WalletResponse> {
    try {
      return await lastValueFrom(this.walletService.createWallet(dto));
    } catch (error) {
      this.handleUpstreamError(error);
    }
  }

  async getWalletByUserId(userId: string): Promise<WalletResponse> {
    try {
      return await lastValueFrom(this.walletService.getWallet({ userId }));
    } catch (error) {
      this.handleUpstreamError(error);
    }
  }

  async creditWallet(userId: string, amount: number): Promise<WalletResponse> {
    try {
      return await lastValueFrom(
        this.walletService.creditWallet({ userId, amount }),
      );
    } catch (error) {
      this.handleUpstreamError(error);
    }
  }

  async debitWallet(userId: string, amount: number): Promise<WalletResponse> {
    try {
      return await lastValueFrom(
        this.walletService.debitWallet({ userId, amount }),
      );
    } catch (error) {
      this.handleUpstreamError(error);
    }
  }

  private handleUpstreamError(error: unknown): never {
    this.logUpstreamFailure(error);

    if (error instanceof RpcException) throw error;
    const message =
      error instanceof Error ? error.message : 'Wallet service error';
    throw new HttpException(message, HttpStatus.BAD_GATEWAY);
  }

  private logUpstreamFailure(error: unknown): void {
    if (error instanceof RpcException) {
      const inner = error.getError();
      let message: string;
      let code: unknown;
      if (typeof inner === 'string') {
        message = inner;
      } else if (inner && typeof inner === 'object') {
        const o = inner as Record<string, unknown>;
        message = String(o.message ?? JSON.stringify(inner));
        code = o.code;
      } else {
        message = String(inner);
      }
      this.logger.error(
        `message=${message} code=${String(code)} stack=${error.stack ?? ''}`,
      );
      return;
    }
    if (error instanceof Error) {
      const code =
        'code' in error
          ? (error as NodeJS.ErrnoException).code
          : undefined;
      this.logger.error(
        `message=${error.message} code=${String(code)} stack=${error.stack ?? ''}`,
      );
      return;
    }
    this.logger.error(
      `message=${String(error)} code=undefined stack=undefined`,
    );
  }
}
