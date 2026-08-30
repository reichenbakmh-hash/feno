function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

export async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 120000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return toHex(derived);
}

export function generateSalt() {
  return randomHex(16);
}

export async function verifyPassword(password, salt, hash) {
  const candidate = await hashPassword(password, salt);
  return timingSafeEqual(candidate, hash);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function generateSessionToken() {
  return randomHex(32);
}

export async function hashToken(token) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token));
  return toHex(digest);
}

export function generateId(prefix) {
  return `${prefix}_${randomHex(12)}`;
}

export function generateInviteCode() {
  return randomHex(4).toUpperCase();
}
