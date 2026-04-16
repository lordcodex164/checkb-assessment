"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePostgresUrl = normalizePostgresUrl;
function normalizePostgresUrl(raw) {
    const trimmed = raw.trim();
    if (!trimmed)
        return trimmed;
    try {
        const u = new URL(trimmed);
        const host = u.hostname;
        const isLocal = host === 'localhost' ||
            host === '127.0.0.1' ||
            host === '::1' ||
            host.endsWith('.internal');
        if (!isLocal && !u.searchParams.has('sslmode')) {
            u.searchParams.set('sslmode', 'require');
        }
        return u.toString();
    }
    catch {
        return trimmed;
    }
}
//# sourceMappingURL=prisma-url.js.map