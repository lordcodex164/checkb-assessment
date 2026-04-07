import { PinoLogger } from 'nestjs-pino';
import { CreateUserDto } from './dto/createuser.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class UserService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService, logger: PinoLogger);
    createUser(dto: CreateUserDto): Promise<{
        id: any;
        email: any;
        name: any;
    }>;
    getUserById(id: string): Promise<{
        id: any;
        email: any;
        name: any;
    }>;
    private formatUser;
}
