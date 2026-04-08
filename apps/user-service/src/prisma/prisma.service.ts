import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../../node_modules/.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(
    @InjectPinoLogger(PrismaService.name)
    private readonly logger: PinoLogger,
  ) {
    const connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not set or is empty. Prisma cannot connect to PostgreSQL. ' +
          'Set DATABASE_URL in your environment (e.g. Render: add DATABASE_URL from your Postgres; Docker Compose: user-service DATABASE_URL is set in docker-compose.yml).',
      );
    }

    const adapter = new PrismaPg({
      connectionString,
    });
    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }
}
