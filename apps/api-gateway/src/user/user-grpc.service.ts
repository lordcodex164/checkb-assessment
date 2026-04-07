import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { USER_SERVICE } from './user.constants';
import type { UserServiceGrpc } from './interfaces/user-service.grpc';
import type { UserResponse } from './interfaces/user-response.interface';
import type { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserGrpcService implements OnModuleInit {
  private userService: UserServiceGrpc;

  constructor(@Inject(USER_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceGrpc>('UserService');
  }

  createUser(dto: CreateUserDto): Promise<UserResponse> {
    return lastValueFrom(this.userService.createUser(dto));
  }

  getUserById(id: string): Promise<UserResponse> {
    return lastValueFrom(this.userService.getUserById({ id }));
  }
}
