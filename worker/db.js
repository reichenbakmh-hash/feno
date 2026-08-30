export function createStore(db) {
  return {
    async createHousehold({ id, name, inviteCode, createdAt }) {
      await db
        .prepare('INSERT INTO households (id, name, invite_code, created_at) VALUES (?, ?, ?, ?)')
        .bind(id, name, inviteCode, createdAt)
        .run();
    },

    async findHouseholdByInviteCode(inviteCode) {
      return db
        .prepare('SELECT * FROM households WHERE invite_code = ?')
        .bind(inviteCode)
        .first();
    },

    async createUser({ id, householdId, name, email, passwordHash, passwordSalt, role, color, avatarEmoji, createdAt }) {
      await db
        .prepare(
          `INSERT INTO users (id, household_id, name, email, password_hash, password_salt, role, color, avatar_emoji, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(id, householdId, name, email, passwordHash, passwordSalt, role, color, avatarEmoji, createdAt)
        .run();
    },

    async findUserByEmail(email) {
      return db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    },

    async findUserById(id) {
      return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    },

    async listHouseholdMembers(householdId) {
      const { results } = await db
        .prepare('SELECT id, name, role, color, avatar_emoji, created_at FROM users WHERE household_id = ? ORDER BY created_at ASC')
        .bind(householdId)
        .all();
      return results;
    },

    async createSession({ id, userId, tokenHash, expiresAt, createdAt }) {
      await db
        .prepare('INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
        .bind(id, userId, tokenHash, expiresAt, createdAt)
        .run();
    },

    async findSessionByTokenHash(tokenHash) {
      return db.prepare('SELECT * FROM sessions WHERE token_hash = ?').bind(tokenHash).first();
    },

    async deleteSessionByTokenHash(tokenHash) {
      await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    },

    async deleteExpiredSessions(now) {
      await db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now).run();
    },
  };
}
