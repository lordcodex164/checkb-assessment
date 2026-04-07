import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { USER_SERVICE } from '../grpc/grpc-client.module';
import {
  CreateWalletDto,
  GetWalletDto,
  CreditWalletDto,
  DebitWalletDto,
} from './dto/wallet.dto';
import { Prisma } from '@prisma/client';

interface UserServiceGrpc {
  getUserById(data: { id: string }): any;
}

@Injectable()
export class WalletService implements OnModuleInit {
  private userService: UserServiceGrpc;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(USER_SERVICE) private readonly userClient: ClientGrpc,
    @InjectPinoLogger(WalletService.name)
    private readonly logger: PinoLogger,
  ) {}

  onModuleInit() {
    this.userService =
      this.userClient.getService<UserServiceGrpc>('UserService');
  }

  async createWallet(dto: CreateWalletDto) {
    this.logger.info({ userId: dto.userId }, 'Creating wallet for user');

    // Verify user exists via gRPC call to UserService
    await this.verifyUserExists(dto.userId);

    // Check if wallet already exists
    const existingWallet = await this.prisma.wallet.findUnique({
      where: { userId: dto.userId },
    });

    if (existingWallet) {
      this.logger.warn(
        { userId: dto.userId },
        'Wallet already exists for user',
      );
      throw new ConflictException(
        `Wallet already exists for user ${dto.userId}`,
      );
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        userId: dto.userId,
        balance: 0,
        type: dto.type,
      } as Prisma.WalletUncheckedCreateInput,
    });

    this.logger.info(
      { walletId: wallet.id, userId: dto.userId },
      'Wallet created successfully',
    );
    return this.formatWallet(wallet);
  }

  async getWallet(dto: GetWalletDto) {
    this.logger.info({ userId: dto.userId }, 'Fetching wallet for user');

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: dto.userId },
    });

    if (!wallet) {
      this.logger.warn({ userId: dto.userId }, 'Wallet not found');
      throw new NotFoundException(`Wallet not found for user ${dto.userId}`);
    }

    return this.formatWallet(wallet);
  }

  async creditWallet(dto: CreditWalletDto) {
    this.logger.info(
      { userId: dto.userId, amount: dto.amount },
      'Crediting wallet',
    );

    if (dto.amount <= 0) {
      throw new BadRequestException('Credit amount must be greater than zero');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: dto.userId },
    });

    if (!wallet) {
      this.logger.warn({ userId: dto.userId }, 'Wallet not found for credit');
      throw new NotFoundException(`Wallet not found for user ${dto.userId}`);
    }

    // Use Prisma transaction for safe balance update
    const updatedWallet = await this.prisma.$transaction(async (tx) => {
      // Re-fetch inside transaction for row-level consistency
      const current = await tx.wallet.findUnique({
        where: { userId: dto.userId },
      });

      if (!current) {
        throw new NotFoundException(`Wallet not found for user ${dto.userId}`);
      }

      return tx.wallet.update({
        where: { userId: dto.userId },
        data: {
          balance: { increment: dto.amount },
        },
      });
    });

    this.logger.info(
      { userId: dto.userId, newBalance: updatedWallet.balance },
      'Wallet credited successfully',
    );

    return this.formatWallet(updatedWallet);
  }

  async debitWallet(dto: DebitWalletDto) {
    this.logger.info(
      { userId: dto.userId, amount: dto.amount },
      'Debiting wallet',
    );

    if (dto.amount <= 0) {
      throw new BadRequestException('Debit amount must be greater than zero');
    }

    // Use Prisma transaction for atomic debit with balance check
    const updatedWallet = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: dto.userId },
      });

      if (!wallet) {
        this.logger.warn({ userId: dto.userId }, 'Wallet not found for debit');
        throw new NotFoundException(`Wallet not found for user ${dto.userId}`);
      }

      if (Number(wallet.balance) < dto.amount) {
        this.logger.warn(
          {
            userId: dto.userId,
            balance: wallet.balance,
            requested: dto.amount,
          },
          'Insufficient balance',
        );
        throw new BadRequestException(
          `Insufficient balance. Available: ${wallet.balance}, Requested: ${dto.amount}`,
        );
      }

      return tx.wallet.update({
        where: { userId: dto.userId },
        data: {
          balance: { decrement: dto.amount },
        },
      });
    });

    this.logger.info(
      { userId: dto.userId, newBalance: updatedWallet.balance },
      'Wallet debited successfully',
    );

    return this.formatWallet(updatedWallet);
  }

  private async verifyUserExists(userId: string): Promise<void> {
    try {
      this.logger.info(
        { userId },
        'Verifying user exists via UserService gRPC',
      );
      await firstValueFrom(this.userService.getUserById({ id: userId }));
      this.logger.info({ userId }, 'User verified successfully');
    } catch (error) {
      this.logger.warn(
        { userId, error: error.message },
        'User verification failed',
      );

      if (
        error?.code === status.NOT_FOUND ||
        error?.details?.includes('not found')
      ) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  private formatWallet(wallet: any) {
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      type: wallet.type,
      createdAt: wallet?.createdAt?.toISOString(),
    };
  }
}
