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


  async createUser(dto: any) {

    // Super detailed logging
    this.logger.info({ 
      op: 'createUser', 
      receivedDto: dto,
      keys: Object.keys(dto || {}),
      email: dto?.email,
      name: dto?.name,
      emailType: typeof dto?.email
    }, 'Full DTO received from gRPC');
  
    // Strong validation
    if (!dto?.email || typeof dto.email !== 'string' || dto.email.trim() === '') {
      this.logger.error({ received: dto }, 'Email is missing or invalid');
      throw new Error('Email is required');
    }
  
    if (!dto?.name || typeof dto.name !== 'string' || dto.name.trim() === '') {
      this.logger.error({ received: dto }, 'Name is missing or invalid');
      throw new Error('Name is required');
    }
  
    const email = dto.email.trim();
    const name = dto.name.trim();
  
    this.logger.info({ op: 'createUser', email }, 'Checking email uniqueness before insert');
  
    console.log("email passed to Prisma:", email);
  
    // Use findUnique instead of findFirst (since email is @unique)
    const existingUser = await this.prisma.user.findUnique({
      where: { 
        email: email 
      },
    });
  
    if (existingUser) {
      this.logger.warn({ op: 'createUser', email }, 'Email already registered');
      throw new ConflictException(`User with email ${email} already exists`);
    }
  
    const user = await this.prisma.user.create({
      data: {
        email: email,
        name: name,
      },
    });
  
    this.logger.info({ op: 'createUser', userId: user.id, email: user.email }, 'User created successfully');
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
