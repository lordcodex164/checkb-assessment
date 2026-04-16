try {
  // prefer require here so it doesn't break when compiled or when dotenv isn't present
  // (this keeps the file safe even if dotenv is not installed inside the Docker image)
  //eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
} catch (err) {
  // dotenv not installed — continue without it
}

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  engine: "classic",
  schema: 'schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});