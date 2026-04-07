import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateUserDto } from './dto/createuser.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(UserService.name)
    private readonly logger: PinoLogger,
  ) {}

  async createUser(dto: CreateUserDto) {
    this.logger.info({ email: dto.email }, 'Creating new user');

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      this.logger.warn({ email: dto.email }, 'User with email already exists');
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
      },
    });

    this.logger.info({ userId: user.id }, 'User created successfully');
    return this.formatUser(user);
  }

  async getUserById(id: string) {
    this.logger.info({ userId: id }, 'Fetching user by ID');

    if (!id || id.trim() === '') {
      throw new NotFoundException('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      this.logger.warn({ userId: id }, 'User not found');
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.info({ userId: id }, 'User fetched successfully');
    return this.formatUser(user);
  }

  //todo: use a type for the user object
  private formatUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
