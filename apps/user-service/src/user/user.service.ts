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
    this.logger.info(
      { op: 'createUser', email: dto.email, nameLength: dto.name.length },
      'Checking email uniqueness before insert',
    );

    const existingUser = await this.prisma.user.findUnique({
      where: { email: "test@test.com" },
    });

    if (existingUser) {
      this.logger.warn(
        { op: 'createUser', email: dto.email, existingUserId: existingUser.id },
        'Email already registered',
      );
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

    this.logger.info(
      {
        op: 'createUser',
        userId: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      'User persisted',
    );
    return this.formatUser(user);
  }

  async getUserById(id: string) {
    this.logger.debug({ op: 'getUserById', userId: id }, 'Prisma findUnique');

    if (!id || id.trim() === '') {
      this.logger.warn({ op: 'getUserById' }, 'Rejected empty user id');
      throw new NotFoundException('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      this.logger.warn({ op: 'getUserById', userId: id }, 'No row for id');
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.info(
      { op: 'getUserById', userId: user.id, email: user.email },
      'User loaded',
    );
    return this.formatUser(user);
  }

  private formatUser(user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
