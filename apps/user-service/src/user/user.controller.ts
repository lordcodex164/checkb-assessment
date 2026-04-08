import {
  ConflictException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createuser.dto';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectPinoLogger(UserController.name)
    private readonly logger: PinoLogger,
  ) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: { email: string; name: string }) {
    const rpc = 'UserService.CreateUser';
    this.logger.info(
      { rpc, email: data?.email, nameLength: data?.name?.length ?? 0 },
      'gRPC request received',
    );

    const dto = plainToInstance(CreateUserDto, data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints || {}),
      );
      const fields = errors.map((e) => e.property);
      this.logger.warn(
        { rpc, fields, errors: messages },
        'Validation failed for CreateUser',
      );
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: messages.join('; '),
      });
    }

    try {
      const result = await this.userService.createUser(dto);
      this.logger.info(
        { rpc, userId: result.id, email: result.email },
        'CreateUser completed',
      );
      return result;
    } catch (error) {
      this.logRpcFailure(rpc, error);
      if (error instanceof ConflictException) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: error.message,
        });
      }
      const err = error as Error;
      throw new RpcException({
        code: status.INTERNAL,
        message: err.message || 'Internal server error',
      });
    }
  }

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: { id: string }) {
    const rpc = 'UserService.GetUserById';
    this.logger.info({ rpc, userId: data?.id }, 'gRPC request received');

    if (!data.id || data.id.trim() === '') {
      this.logger.warn({ rpc }, 'Missing or empty user id');
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'User ID is required',
      });
    }

    try {
      const result = await this.userService.getUserById(data.id);
      this.logger.info(
        { rpc, userId: result.id },
        'GetUserById completed',
      );
      return result;
    } catch (error) {
      this.logRpcFailure(rpc, error);
      if (error instanceof NotFoundException) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: error.message,
        });
      }
      const err = error as Error;
      throw new RpcException({
        code: status.INTERNAL,
        message: err.message || 'Internal server error',
      });
    }
  }

  private logRpcFailure(rpc: string, error: unknown): void {
    if (error instanceof NotFoundException) {
      this.logger.warn(
        {
          rpc,
          errMessage: error.message,
          httpStatus: error.getStatus(),
        },
        'gRPC handler: not found',
      );
      return;
    }
    if (error instanceof ConflictException) {
      this.logger.warn(
        {
          rpc,
          errMessage: error.message,
          httpStatus: error.getStatus(),
        },
        'gRPC handler: conflict',
      );
      return;
    }
    if (error instanceof RpcException) {
      this.logger.error(
        {
          rpc,
          errMessage: error.message,
          rpcError: error.getError(),
          errStack: error.stack,
        },
        'gRPC handler failed (RpcException)',
      );
      return;
    }
    if (error instanceof Error) {
      this.logger.error(
        {
          rpc,
          errMessage: error.message,
          errName: error.name,
          errStack: error.stack,
        },
        'gRPC handler failed',
      );
      return;
    }
    this.logger.error({ rpc, error: String(error) }, 'gRPC handler failed');
  }
}
