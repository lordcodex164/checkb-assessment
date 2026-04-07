import { resolve } from 'path';

/** Monorepo root, resolved from compiled output under `apps/api-gateway/dist/`. */
const workspaceRoot = resolve(__dirname, '../..', '..');

export const USER_PROTO_PATH = resolve(
  workspaceRoot,
  'packages/proto/user.proto',
);

export const WALLET_PROTO_PATH = resolve(
  workspaceRoot,
  'packages/proto/wallet.proto',
);
