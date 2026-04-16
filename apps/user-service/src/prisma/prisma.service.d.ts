import { OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from "@node_modules/.prisma/client";
export declare class PrismaService extends PrismaClient implements OnModuleDestroy {
    private readonly pool;
    constructor();
    onModuleDestroy(): Promise<void>;
}
