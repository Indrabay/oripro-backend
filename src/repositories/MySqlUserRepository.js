const { getMysqlPool } = require('../config/db');
const { User } = require('../entity/User');

class MySqlUserRepository {
  constructor(poolPromise) {
    this.poolPromise = poolPromise || getMysqlPool();
  }

  async findByEmail(email, ctx = {}) {
    ctx.log?.debug({ email }, 'repo_find_user_by_email');
    const pool = await this.poolPromise;
    const [rows] = await pool.query(
      `SELECT id, email, password, name, role_id, created_at, updated_at, created_by, updated_by
       FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`,
      [email]
    );
    if (!rows[0]) return null;
    return User.fromRow(rows[0]);
  }

  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_find_user_by_id');
    const pool = await this.poolPromise;
    const [rows] = await pool.query(
      `SELECT id, email, password, name, role_id, created_at, updated_at, created_by, updated_by
       FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;
    return User.fromRow(rows[0]);
  }

  async create({ email, password, name, roleId, createdBy }, ctx = {}) {
    ctx.log?.info({ email }, 'repo_create_user');
    const pool = await this.poolPromise;
    const id = (await pool.query('SELECT UUID() AS id'))[0][0].id;
    await pool.query(
      `INSERT INTO users (id, email, password, name, role_id, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, email, password, name || null, roleId || null, createdBy || null]
    );
    return this.findById(id);
  }

  async updatePassword(userId, password, ctx = {}) {
    ctx.log?.info({ userId }, 'repo_update_password');
    const pool = await this.poolPromise;
    await pool.query(
      `UPDATE users SET password = ?, updated_at = NOW(), updated_by = ? WHERE id = ?`,
      [password, userId, userId]
    );
    return this.findById(userId);
  }
}

module.exports = { MySqlUserRepository };


