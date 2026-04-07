import { resolve } from 'path';

/**
 * Monorepo root, resolved from compiled output under `apps/api-gateway/dist/`.
 * In Docker (`WORKDIR /app`, app at `apps/api-gateway/dist`), three levels up is `/app`,
 * so proto files must exist at `/app/packages/proto/*.proto` (see api-gateway Dockerfile).
 */
const workspaceRoot = resolve(__dirname, '../..', '..');

export const USER_PROTO_PATH = resolve(
  workspaceRoot,
  'packages/proto/user.proto',
);

export const WALLET_PROTO_PATH = resolve(
  workspaceRoot,
  'packages/proto/wallet.proto',
);
