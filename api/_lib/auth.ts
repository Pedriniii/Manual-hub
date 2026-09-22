import crypto from 'crypto';

const SALT = 'manualhub_salt_2026';

/**
 * Hash password with PBKDF2 SHA-512
 */
export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 10000, 64, 'sha512').toString('hex');
}

/**
 * Verify password against stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const hash = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

/**
 * Generates session token for authenticated user
 */
export function createSessionToken(userId: string, email: string): string {
  const payload = JSON.stringify({ userId, email, exp: Date.now() + 7 * 86400000 });
  const signature = crypto.createHmac('sha256', SALT).update(payload).digest('hex');
  return Buffer.from(`${payload}.${signature}`).toString('base64url');
}

/**
 * Verify session token from Authorization header or cookie
 */
export function verifySessionToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [payloadStr, signature] = decoded.split('.');
    
    const expectedSignature = crypto.createHmac('sha256', SALT).update(payloadStr).digest('hex');
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(payloadStr);
    if (payload.exp && payload.exp < Date.now()) return null;

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}
