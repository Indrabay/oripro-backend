const { getPgPool } = require('../config/db');

class PostgresAssetRepository {
  constructor(pool = getPgPool()) {
    this.pool = pool;
  }

  async create({ name, description, ownerId, longitude, latitude, createdBy }, ctx = {}) {
    ctx.log?.info({ name }, 'repo_assets_create');
    const { rows } = await this.pool.query(
      `INSERT INTO assets (name, description, owner_id, longitude, latitude, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, owner_id, longitude, latitude, created_by, updated_by, created_at, updated_at`,
      [name, description || null, ownerId || null, longitude ?? null, latitude ?? null, createdBy || null]
    );
    return rows[0];
  }

  async assignAdmin(assetId, userId, ctx = {}) {
    ctx.log?.debug({ assetId, userId }, 'repo_assets_assign_admin');
    await this.pool.query(
      `INSERT INTO asset_admins (asset_id, user_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [assetId, userId]
    );
  }

  async isAdminAssigned(assetId, userId, ctx = {}) {
    ctx.log?.debug({ assetId, userId }, 'repo_assets_is_admin_assigned');
    const { rows } = await this.pool.query(
      `SELECT 1 FROM asset_admins WHERE asset_id = $1 AND user_id = $2 LIMIT 1`,
      [assetId, userId]
    );
    return !!rows[0];
  }

  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_assets_find_by_id');
    const { rows } = await this.pool.query(
      `SELECT id, name, description, owner_id, longitude, latitude, created_by, updated_by, created_at, updated_at FROM assets WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async listAll(ctx = {}) {
    ctx.log?.debug({}, 'repo_assets_list_all');
    const { rows } = await this.pool.query(
      `SELECT id, name, description, owner_id, longitude, latitude, created_by, updated_by, created_at, updated_at
       FROM assets ORDER BY created_at DESC`
    );
    return rows;
  }

  async listForAdmin(userId, ctx = {}) {
    ctx.log?.debug({ userId }, 'repo_assets_list_for_admin');
    const { rows } = await this.pool.query(
      `SELECT a.id, a.name, a.description, a.owner_id, a.longitude, a.latitude, a.created_by, a.updated_by, a.created_at, a.updated_at
       FROM assets a
       JOIN asset_admins aa ON aa.asset_id = a.id
       WHERE aa.user_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async update(id, { name, description, longitude, latitude, updatedBy }, ctx = {}) {
    ctx.log?.info({ id }, 'repo_assets_update');
    const { rows } = await this.pool.query(
      `UPDATE assets SET name = COALESCE($2, name), description = COALESCE($3, description),
       longitude = COALESCE($4, longitude), latitude = COALESCE($5, latitude),
       updated_by = COALESCE($6, updated_by), updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, description, owner_id, longitude, latitude, created_by, updated_by, created_at, updated_at`,
      [id, name || null, description || null, longitude ?? null, latitude ?? null, updatedBy || null]
    );
    return rows[0] || null;
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, 'repo_assets_delete');
    await this.pool.query(`DELETE FROM asset_admins WHERE asset_id = $1`, [id]);
    const { rowCount } = await this.pool.query(`DELETE FROM assets WHERE id = $1`, [id]);
    return rowCount > 0;
  }
}

module.exports = { PostgresAssetRepository };


