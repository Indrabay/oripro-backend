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

  async listAll(ctx = {}) {
    ctx.log?.info({}, 'repo_list_all_users');
    const pool = await this.poolPromise;
    const [rows] = await pool.query(
      `SELECT id, email, password, name, role_id, created_at, updated_at, created_by, updated_by
       FROM users ORDER BY created_at DESC`
    );
    return rows.map(row => User.fromRow(row));
  }

  async update(id, userData, ctx = {}) {
    ctx.log?.info({ id }, 'repo_update_user');
    const { email, name, roleId } = userData;
    const pool = await this.poolPromise;
    
    const updateFields = [];
    const values = [];

    if (email !== undefined) {
      updateFields.push('email = ?');
      values.push(email);
    }
    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (roleId !== undefined) {
      updateFields.push('role_id = ?');
      values.push(roleId);
    }

    if (updateFields.length === 0) {
      return this.findById(id, ctx);
    }

    updateFields.push('updated_at = NOW()');
    updateFields.push('updated_by = ?');
    values.push(userData.updatedBy);

    values.push(id);

    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    return this.findById(id, ctx);
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_delete_user');
    const pool = await this.poolPromise;
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = { MySqlUserRepository };


