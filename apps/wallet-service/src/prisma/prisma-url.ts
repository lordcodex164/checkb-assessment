/**
 * Cloud Postgres (e.g. Render) usually requires TLS. The `pg` driver reads
 * `sslmode` from the URL; without it, connections can fail with misleading errors
 * like "User was denied access on the database `(not available)`".
 */
export function normalizePostgresUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  try {
    const u = new URL(trimmed);
    const host = u.hostname;
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.endsWith('.internal');

    if (!isLocal && !u.searchParams.has('sslmode')) {
      u.searchParams.set('sslmode', 'require');
    }
    return u.toString();
  } catch {
    return trimmed;
  }
}
