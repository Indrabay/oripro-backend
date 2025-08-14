const { getMysqlPool } = require('../config/db');

class MySqlRoleRepository {
  constructor(poolPromise) {
    this.poolPromise = poolPromise || getMysqlPool();
  }

  async findNameById(id) {
    const pool = await this.poolPromise;
    const [rows] = await pool.query('SELECT name FROM roles WHERE id = ?', [id]);
    return rows[0]?.name || null;
  }
}

module.exports = { MySqlRoleRepository };


