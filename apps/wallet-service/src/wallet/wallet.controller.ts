import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { status } from '@grpc/grpc-js';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { WalletService } from './wallet.service';
import {
  CreateWalletDto,
  GetWalletDto,
  CreditWalletDto,
  DebitWalletDto,
} from './dto/wallet.dto';

@Controller()
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    @InjectPinoLogger(WalletController.name)
    private readonly logger: PinoLogger,
  ) {}

  @GrpcMethod('WalletService', 'CreateWallet')
  async createWallet(data: { userId: string }) {
    this.logger.info({ data }, 'gRPC CreateWallet called');
    await this.validateDto(CreateWalletDto, data);

    try {
      return await this.walletService.createWallet(data as CreateWalletDto);
    } catch (error) {
      this.mapError(error, 'CreateWallet');
    }
  }

  @GrpcMethod('WalletService', 'GetWallet')
  async getWallet(data: { userId: string }) {
    this.logger.info({ data }, 'gRPC GetWallet called');
    await this.validateDto(GetWalletDto, data);

    try {
      return await this.walletService.getWallet(data as GetWalletDto);
    } catch (error) {
      this.mapError(error, 'GetWallet');
    }
  }

  @GrpcMethod('WalletService', 'CreditWallet')
  async creditWallet(data: { userId: string; amount: number }) {
    this.logger.info({ data }, 'gRPC CreditWallet called');
    await this.validateDto(CreditWalletDto, data);

    try {
      return await this.walletService.creditWallet(data as CreditWalletDto);
    } catch (error) {
      this.mapError(error, 'CreditWallet');
    }
  }

  @GrpcMethod('WalletService', 'DebitWallet')
  async debitWallet(data: { userId: string; amount: number }) {
    this.logger.info({ data }, 'gRPC DebitWallet called');
    await this.validateDto(DebitWalletDto, data);

    try {
      return await this.walletService.debitWallet(data as DebitWalletDto);
    } catch (error) {
      this.mapError(error, 'DebitWallet');
    }
  }

  private async validateDto<T extends object>(
    DtoClass: new () => T,
    data: object,
  ): Promise<void> {
    const dto = plainToInstance(DtoClass, data);
    const errors = await validate(dto as object);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints || {}),
      );
      this.logger.warn({ errors: messages }, 'Validation failed');
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: messages.join('; '),
      });
    }
  }

  private mapError(error: any, method: string): never {
    this.logger.error({ error: error.message, method }, `Error in ${method}`);

    // Already an RpcException — re-throw as-is
    if (error instanceof RpcException) throw error;

    const msg = error.message || 'Internal server error';

    if (error.status === 404) {
      throw new RpcException({ code: status.NOT_FOUND, message: msg });
    }
    if (error.status === 409) {
      throw new RpcException({ code: status.ALREADY_EXISTS, message: msg });
    }
    if (error.status === 400) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: msg,
      });
    }

    throw new RpcException({ code: status.INTERNAL, message: msg });
  }
}
