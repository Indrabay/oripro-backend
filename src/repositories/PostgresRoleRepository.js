const { getPgPool } = require('../config/db');

class PostgresRoleRepository {
  constructor(pool = getPgPool()) {
    this.pool = pool;
  }

  async findNameById(id) {
    const { rows } = await this.pool.query('SELECT name FROM roles WHERE id = $1', [id]);
    return rows[0]?.name || null;
  }
}

module.exports = { PostgresRoleRepository };


