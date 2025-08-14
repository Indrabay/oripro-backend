const { getPgPool } = require('../config/db');

class PostgresPasswordResetTokenRepository {
  constructor(pool = getPgPool()) {
    this.pool = pool;
  }

  async createToken({ userId, tokenHash, expiresAt }, ctx = {}) {
    ctx.log?.debug({ userId }, 'repo_prt_create_token');
    const { rows } = await this.pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, token_hash, expires_at, used_at, created_at`,
      [userId, tokenHash, expiresAt]
    );
    return rows[0];
  }

  async findValidByTokenHash(tokenHash, ctx = {}) {
    ctx.log?.debug({}, 'repo_prt_find_valid_by_hash');
    const { rows } = await this.pool.query(
      `SELECT id, user_id, token_hash, expires_at, used_at, created_at
       FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  async markUsed(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_prt_mark_used');
    await this.pool.query(
      `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  async deleteAllForUser(userId, ctx = {}) {
    ctx.log?.debug({ userId }, 'repo_prt_delete_all_for_user');
    await this.pool.query(
      `DELETE FROM password_reset_tokens WHERE user_id = $1`,
      [userId]
    );
  }
}

module.exports = { PostgresPasswordResetTokenRepository };


