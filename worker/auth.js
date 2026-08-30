import {
  hashPassword,
  verifyPassword,
  generateSalt,
  generateSessionToken,
  hashToken,
  generateId,
  generateInviteCode,
} from './crypto.js';
import { json, jsonError, withSessionCookie, clearSessionCookie, readCookie } from './responses.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleRegisterHousehold(request, env, store) {
  const body = await request.json().catch(() => null);
  if (!body) return jsonError('Corps de requête invalide');

  const householdName = String(body.householdName || '').trim();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!householdName || !name) return jsonError('Le nom du foyer et le tien sont requis');
  if (!EMAIL_PATTERN.test(email)) return jsonError('Adresse e-mail invalide');
  if (password.length < 8) return jsonError('Le mot de passe doit contenir au moins 8 caractères');

  const existing = await store.findUserByEmail(email);
  if (existing) return jsonError('Un compte existe déjà avec cet e-mail', 409);

  const now = Date.now();
  const householdId = generateId('hh');
  await store.createHousehold({
    id: householdId,
    name: householdName,
    inviteCode: generateInviteCode(),
    createdAt: now,
  });

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const userId = generateId('usr');
  await store.createUser({
    id: userId,
    householdId,
    name,
    email,
    passwordHash,
    passwordSalt: salt,
    role: 'admin',
    color: '#2F4F3E',
    avatarEmoji: '🌿',
    createdAt: now,
  });

  return startSession(env, store, userId, isSecureRequest(request));
}

export async function handleLogin(request, env, store) {
  const body = await request.json().catch(() => null);
  if (!body) return jsonError('Corps de requête invalide');

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  const user = await store.findUserByEmail(email);
  if (!user) return jsonError('Identifiants incorrects', 401);

  const valid = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!valid) return jsonError('Identifiants incorrects', 401);

  return startSession(env, store, user.id, isSecureRequest(request));
}

export async function handleLogout(request, env, store) {
  const token = readCookie(request, env.SESSION_COOKIE_NAME);
  if (token) {
    const tokenHash = await hashToken(token);
    await store.deleteSessionByTokenHash(tokenHash);
  }
  return clearSessionCookie(json({ ok: true }), env.SESSION_COOKIE_NAME, isSecureRequest(request));
}

function isSecureRequest(request) {
  return new URL(request.url).protocol === 'https:';
}

async function startSession(env, store, userId, secure) {
  const token = generateSessionToken();
  const tokenHash = await hashToken(token);
  const ttlDays = Number(env.SESSION_TTL_DAYS || '30');
  const now = Date.now();
  await store.createSession({
    id: generateId('ses'),
    userId,
    tokenHash,
    expiresAt: now + ttlDays * 24 * 60 * 60 * 1000,
    createdAt: now,
  });
  const response = json({ ok: true });
  return withSessionCookie(response, token, ttlDays, env.SESSION_COOKIE_NAME, secure);
}

export async function getSessionUser(request, env, store) {
  const token = readCookie(request, env.SESSION_COOKIE_NAME);
  if (!token) return null;

  const tokenHash = await hashToken(token);
  const session = await store.findSessionByTokenHash(tokenHash);
  if (!session) return null;

  if (session.expires_at < Date.now()) {
    await store.deleteSessionByTokenHash(tokenHash);
    return null;
  }

  return store.findUserById(session.user_id);
}

export function publicUser(user) {
  return {
    id: user.id,
    householdId: user.household_id,
    name: user.name,
    email: user.email,
    role: user.role,
    color: user.color,
    avatarEmoji: user.avatar_emoji,
  };
}
