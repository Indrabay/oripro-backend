class User {
  constructor({ id, email, password, roleId, name, createdAt, updatedAt, createdBy, updatedBy }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.roleId = roleId || null;
    this.name = name || null;
    this.createdAt = createdAt || null;
    this.updatedAt = updatedAt || null;
    this.createdBy = createdBy || null;
    this.updatedBy = updatedBy || null;
  }

  static fromRow(row) {
    return new User({
      id: row.id,
      email: row.email,
      password: row.password,
      roleId: row.role_id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by
    });
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      roleId: this.roleId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }
}

module.exports = { User };


