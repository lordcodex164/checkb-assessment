import { Controller } from '@nestjs/common';
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
    this.logger.info({ data }, 'gRPC CreateUser called');

    // Validate input
    const dto = plainToInstance(CreateUserDto, data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints || {}),
      );
      this.logger.warn(
        { errors: messages },
        'Validation failed for CreateUser',
      );
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: messages.join('; '),
      });
    }

    try {
      return await this.userService.createUser(dto);
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error in CreateUser');
      if (error.status === 409) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: error.message,
        });
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message || 'Internal server error',
      });
    }
  }

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: { id: string }) {
    this.logger.info({ userId: data.id }, 'gRPC GetUserById called');

    if (!data.id || data.id.trim() === '') {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'User ID is required',
      });
    }

    try {
      return await this.userService.getUserById(data.id);
    } catch (error) {
      this.logger.error({ error: error.message }, 'Error in GetUserById');
      if (error.status === 404) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: error.message,
        });
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: error.message || 'Internal server error',
      });
    }
  }
}
