import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from "@node_modules/.prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { normalizePostgresUrl } from './prisma-url';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not set or is empty. Prisma cannot connect to PostgreSQL. ' +
          'Set DATABASE_URL in your environment (e.g. Render: add DATABASE_URL from your Postgres).',
      );
    }

    const url = normalizePostgresUrl(connectionString);
    const pool = new Pool({
      connectionString: url,
      max: 10,
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    this.pool = pool;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
