const { getMysqlPool } = require('../config/db');

class MySqlPasswordResetTokenRepository {
  constructor(poolPromise) {
    this.poolPromise = poolPromise || getMysqlPool();
  }

  async createToken({ userId, tokenHash, expiresAt }, ctx = {}) {
    ctx.log?.debug({ userId }, 'repo_mrt_create_token');
    const pool = await this.poolPromise;
    const [result] = await pool.query(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES (UUID(), ?, ?, ?, NOW())`,
      [userId, tokenHash, expiresAt]
    );
    return { id: result.insertId, user_id: userId, token_hash: tokenHash, expires_at: expiresAt };
  }

  async findValidByTokenHash(tokenHash, ctx = {}) {
    ctx.log?.debug({}, 'repo_mrt_find_valid_by_hash');
    const pool = await this.poolPromise;
    const [rows] = await pool.query(
      `SELECT id, user_id, token_hash, expires_at, used_at, created_at
       FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  async markUsed(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_mrt_mark_used');
    const pool = await this.poolPromise;
    await pool.query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?`, [id]);
  }

  async deleteAllForUser(userId, ctx = {}) {
    ctx.log?.debug({ userId }, 'repo_mrt_delete_all_for_user');
    const pool = await this.poolPromise;
    await pool.query(`DELETE FROM password_reset_tokens WHERE user_id = ?`, [userId]);
  }
}

module.exports = { MySqlPasswordResetTokenRepository };


