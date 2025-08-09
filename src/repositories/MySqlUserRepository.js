const { getMysqlPool } = require('../config/db');
const { User } = require('../entity/User');

class MySqlUserRepository {
  constructor(poolPromise) {
    this.poolPromise = poolPromise || getMysqlPool();
  }

  async findByEmail(email) {
    const pool = await this.poolPromise;
    const [rows] = await pool.query(
      `SELECT id, email, password, name, role_id, created_at, updated_at, created_by, updated_by
       FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`,
      [email]
    );
    if (!rows[0]) return null;
    return User.fromRow(rows[0]);
  }

  async findById(id) {
    const pool = await this.poolPromise;
    const [rows] = await pool.query(
      `SELECT id, email, password, name, role_id, created_at, updated_at, created_by, updated_by
       FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;
    return User.fromRow(rows[0]);
  }

  async create({ email, password, name, roleId, createdBy }) {
    const pool = await this.poolPromise;
    const [result] = await pool.query(
      `INSERT INTO users (id, email, password, name, role_id, created_by, created_at, updated_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())`,
      [email, password, name || null, roleId || null, createdBy || null]
    );
    const insertedId = result.insertId || null;
    const user = await this.findById(insertedId);
    return user;
  }
}

module.exports = { MySqlUserRepository };


