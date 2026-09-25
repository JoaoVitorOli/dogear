import { createHash, randomBytes } from 'node:crypto';

const API_KEY_PREFIX = 'dk_live_';

export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

export function generateApiKey() {
  const apiKey = `${API_KEY_PREFIX}${randomBytes(32).toString('base64url')}`;

  return {
    apiKey,
    keyHash: hashApiKey(apiKey),
    lastFour: apiKey.slice(-4),
  };
}