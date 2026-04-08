import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class UserService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService, logger: PinoLogger);
    createUser(dto: any): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: string;
    }>;
    getUserById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: string;
    }>;
    private formatUser;
}
