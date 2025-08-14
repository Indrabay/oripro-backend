const { getPgPool } = require('../config/db');
const { User } = require('../entity/User');

class PostgresUserRepository {
  constructor(pool = getPgPool()) {
    this.pool = pool;
  }

  async findByEmail(email, ctx = {}) {
    ctx.log?.debug({ email }, 'repo_find_user_by_email');
    const { rows } = await this.pool.query(
      `SELECT id, email, password, name, role_id, created_at, updated_at, created_by, updated_by
       FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );
    if (!rows[0]) return null;
    return User.fromRow(rows[0]);
  }

  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_find_user_by_id');
    const { rows } = await this.pool.query(
      `SELECT id, email, password, name, role_id, created_at, updated_at, created_by, updated_by
       FROM users WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;
    return User.fromRow(rows[0]);
  }

  async create({ email, password, name, roleId, createdBy }, ctx = {}) {
    ctx.log?.info({ email }, 'repo_create_user');
    const { rows } = await this.pool.query(
      `INSERT INTO users (email, password, name, role_id, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, password, name, role_id, created_at, updated_at, created_by, updated_by`,
      [email, password, name || null, roleId || null, createdBy || null]
    );
    return User.fromRow(rows[0]);
  }

  async updatePassword(userId, password, ctx = {}) {
    ctx.log?.info({ userId }, 'repo_update_password');
    const { rows } = await this.pool.query(
      `UPDATE users SET password = $2, updated_at = NOW(), updated_by = $1 WHERE id = $1
       RETURNING id, email, password, name, role_id, created_at, updated_at, created_by, updated_by`,
      [userId, password]
    );
    return rows[0] ? User.fromRow(rows[0]) : null;
  }
}

module.exports = { PostgresUserRepository };

