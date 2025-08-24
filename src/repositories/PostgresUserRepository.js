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

  async listAll(ctx = {}) {
    ctx.log?.info({}, 'repo_list_all_users');
    const { rows } = await this.pool.query(
      `SELECT id, email, password, name, role_id, created_at, updated_at, created_by, updated_by
       FROM users ORDER BY created_at DESC`
    );
    return rows.map(row => User.fromRow(row));
  }

  async update(id, userData, ctx = {}) {
    ctx.log?.info({ id }, 'repo_update_user');
    const { email, name, roleId } = userData;
    
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (email !== undefined) {
      updateFields.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (roleId !== undefined) {
      updateFields.push(`role_id = $${paramCount++}`);
      values.push(roleId);
    }

    if (updateFields.length === 0) {
      return this.findById(id, ctx);
    }

    updateFields.push(`updated_at = NOW()`);
    updateFields.push(`updated_by = $${paramCount++}`);
    values.push(userData.updatedBy);

    values.push(id);

    const { rows } = await this.pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, password, name, role_id, created_at, updated_at, created_by, updated_by`,
      values
    );
    return rows[0] ? User.fromRow(rows[0]) : null;
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_delete_user');
    const { rowCount } = await this.pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }
}

module.exports = { PostgresUserRepository };

