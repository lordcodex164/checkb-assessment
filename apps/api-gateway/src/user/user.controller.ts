import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserGrpcService } from './user-grpc.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userGrpc: UserGrpcService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userGrpc.createUser(createUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userGrpc.getUserById(id);
  }
}
