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


  async createUser(dto: any) {   // ← Change to `any` temporarily for debugging

    // Log the FULL incoming object so we can see its real shape
    this.logger.info({ 
      op: 'createUser', 
      receivedDto: dto,
      dtoType: typeof dto,
      keys: Object.keys(dto || {}),
      emailValue: dto?.email,
      emailType: typeof dto?.email
    }, 'Full DTO received from gRPC');
  
    if (!dto?.email || typeof dto.email !== 'string') {
      this.logger.error({ dto }, 'Email is missing or invalid');
      throw new Error('Email is required and must be a string');
    }
  
    if (!dto?.name || typeof dto.name !== 'string') {
      this.logger.error({ dto }, 'Name is missing or invalid');
      throw new Error('Name is required');
    }
  
    this.logger.info(
      { op: 'createUser', email: dto.email },
      'Checking email uniqueness before insert'
    );
  
    console.log("email is ", dto.email);
  
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email.trim() },   // trim just in case
    });
  
    if (existingUser) {
      this.logger.warn({ op: 'createUser', email: dto.email }, 'Email already registered');
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }
  
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.trim(),
        name: dto.name.trim(),
      },
    });
  
    this.logger.info({ op: 'createUser', userId: user.id }, 'User created successfully');
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
      {
        op: 'getUserById',
        userId: user.id,
        email: user.email,
      },
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
