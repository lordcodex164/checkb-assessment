import { PrismaClient } from '../../../../node_modules/.prisma/client';
import { PinoLogger } from 'nestjs-pino';
export declare class PrismaService extends PrismaClient {
    private readonly logger;
    constructor(logger: PinoLogger);
}
