const { getMysqlPool } = require('../config/db');

class MySqlAssetRepository {
  constructor(poolPromise) {
    this.poolPromise = poolPromise || getMysqlPool();
  }

  async create({ name, description, ownerId, longitude, latitude, createdBy }, ctx = {}) {
    ctx.log?.info({ name }, 'repo_assets_create');
    const pool = await this.poolPromise;
    const [[{ id }]] = await Promise.all([
      pool.query('SELECT UUID() AS id')
    ]);
    await pool.query(
      `INSERT INTO assets (id, name, description, owner_id, longitude, latitude, created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NOW(), NOW())`,
      [id, name, description || null, ownerId || null, longitude ?? null, latitude ?? null, createdBy || null]
    );
    return this.findById(id);
  }

  async assignAdmin(assetId, userId, ctx = {}) {
    ctx.log?.debug({ assetId, userId }, 'repo_assets_assign_admin');
    const pool = await this.poolPromise;
    await pool.query(
      `INSERT IGNORE INTO asset_admins (asset_id, user_id) VALUES (?, ?)`,
      [assetId, userId]
    );
  }

  async isAdminAssigned(assetId, userId, ctx = {}) {
    ctx.log?.debug({ assetId, userId }, 'repo_assets_is_admin_assigned');
    const pool = await this.poolPromise;
    const [rows] = await pool.query(
      `SELECT 1 FROM asset_admins WHERE asset_id = ? AND user_id = ? LIMIT 1`,
      [assetId, userId]
    );
    return !!rows[0];
  }

  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_assets_find_by_id');
    const pool = await this.poolPromise;
    const [rows] = await pool.query(
      `SELECT id, name, description, owner_id, longitude, latitude, created_by, updated_by, created_at, updated_at FROM assets WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async listAll(ctx = {}) {
    ctx.log?.debug({}, 'repo_assets_list_all');
    const pool = await this.poolPromise;
    const [rows] = await pool.query(
      `SELECT id, name, description, owner_id, longitude, latitude, created_by, updated_by, created_at, updated_at FROM assets ORDER BY created_at DESC`
    );
    return rows;
  }

  async listForAdmin(userId, ctx = {}) {
    ctx.log?.debug({ userId }, 'repo_assets_list_for_admin');
    const pool = await this.poolPromise;
    const [rows] = await pool.query(
      `SELECT a.id, a.name, a.description, a.owner_id, a.longitude, a.latitude, a.created_by, a.updated_by, a.created_at, a.updated_at
       FROM assets a
       JOIN asset_admins aa ON aa.asset_id = a.id
       WHERE aa.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async update(id, { name, description, longitude, latitude, updatedBy }, ctx = {}) {
    ctx.log?.info({ id }, 'repo_assets_update');
    const pool = await this.poolPromise;
    await pool.query(
      `UPDATE assets SET name = COALESCE(?, name), description = COALESCE(?, description),
       longitude = COALESCE(?, longitude), latitude = COALESCE(?, latitude),
       updated_by = COALESCE(?, updated_by), updated_at = NOW()
       WHERE id = ?`,
      [name || null, description || null, longitude ?? null, latitude ?? null, updatedBy || null, id]
    );
    return this.findById(id);
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_assets_delete');
    const pool = await this.poolPromise;
    await pool.query(`DELETE FROM asset_admins WHERE asset_id = ?`, [id]);
    const [result] = await pool.query(`DELETE FROM assets WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = { MySqlAssetRepository };


