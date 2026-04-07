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
import { USER_SERVICE } from './user.constants';
import type { UserServiceGrpc } from './interfaces/user-service.grpc';
import type { UserResponse } from './interfaces/user-response.interface';
import type { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserGrpcService implements OnModuleInit {
  private readonly logger = new Logger(UserGrpcService.name);
  private userService: UserServiceGrpc;

  constructor(@Inject(USER_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceGrpc>('UserService');
  }

  async createUser(dto: CreateUserDto): Promise<UserResponse> {
    try {
      return await lastValueFrom(this.userService.createUser(dto));
    } catch (error) {
      this.handleUpstreamError(error);
    }
  }

  async getUserById(id: string): Promise<UserResponse> {
    try {
      return await lastValueFrom(this.userService.getUserById({ id }));
    } catch (error) {
      this.handleUpstreamError(error);
    }
  }

  private handleUpstreamError(error: unknown): never {
    this.logUpstreamFailure(error);

    if (error instanceof RpcException) throw error;
    const message =
      error instanceof Error ? error.message : 'User service error';
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
