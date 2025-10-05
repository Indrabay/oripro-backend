const { Op } = require("sequelize");
const { UserGenderStrToInt, UserStatusStrToInt } = require("../models/User");

class UserRepository {
  constructor(userModel, roleModel) {
    this.userModel = userModel;
    this.roleModel = roleModel;
  }

  async findByEmail(email, ctx = {}) {
    ctx.log?.debug({ email }, "repo_find_user_by_email");
    const user = await this.userModel.findOne({
      where: { email },
    });
    return user ? user.toJSON() : null;
  }

  async findById(id, ctx = {}) {
    ctx.log?.debug({ id }, "repo_find_user_by_id");
    try {
      const user = await this.userModel.findByPk(id, {
        include: [
          {
            model: this.roleModel,
            as: "role",
            attributes: ["id", "name", "level"],
          },
          {
            model: this.userModel,
            as: "createdBy",
            attributes: ["id", "name", "email"],
          },
          {
            model: this.userModel,
            as: "updatedBy",
            attributes: ["id", "name", "email"],
          },
        ],
      });
      return user ? user.toJSON() : null;
    } catch (error) {
      ctx.log?.error({ error: error.message }, "repo_find_user_by_id_error");
      // Fallback: get user and role separately, then join manually
      try {
        const user = await this.userModel.findByPk(id);
        if (!user) return null;

        const userData = user.toJSON();

        const RoleModel = this.roleModel;
        if (RoleModel && userData.role_id) {
          const role = await RoleModel.findByPk(userData.role_id, {
            attributes: ["id", "name", "level"],
          });
          if (role) {
            userData.role = role.toJSON();
          }
        }

        return userData;
      } catch (fallbackError) {
        ctx.log?.error(
          { error: fallbackError.message },
          "repo_find_user_by_id_fallback_error"
        );
        return null;
      }
    }
  }

  async create(
    { email, password, name, phone, gender, roleId, status, createdBy },
    ctx = {}
  ) {
    ctx.log?.info({ email }, "repo_create_user");
    const user = await this.userModel.create({
      email,
      password,
      name,
      phone,
      gender,
      role_id: roleId,
      status: status || 1,
      created_by: createdBy,
    });
    return user.toJSON();
  }

  async updatePassword(userId, password, ctx = {}) {
    ctx.log?.info({ userId }, "repo_update_password");
    const user = await this.userModel.findByPk(userId);
    if (!user) return null;
    await user.update({ password, updated_at: new Date(), updated_by: userId });
    return user.toJSON();
  }

  async listAll(filters, ctx = {}) {
    ctx.log?.info({}, "repo_list_all_users");
    let whereQuery = {};
    if (
      filters.name ||
      filters.status ||
      filters.email ||
      filters.gender ||
      filters.phone ||
      filters.role_id
    ) {
      whereQuery.where = {};
      if (filters.name) {
        let filterName = filters.name.toLowerCase();
        whereQuery.where.name = {
          [Op.like]: `%${filterName}%`,
        };
      }

      if (filters.status) {
        whereQuery.where.status = UserStatusStrToInt[filters.status];
      }

      if (filters.email) {
        whereQuery.where.email = filters.email;
      }

      if (filters.gender) {
        whereQuery.where.gender = UserGenderStrToInt[filters.gender];
      }

      if (filters.phone) {
        whereQuery.where.phone = filters.phone;
      }

      if (filters.role_id) {
        whereQuery.where.role_id = filters.role_id;
      }
    }

    if (filters.limit) {
      whereQuery.limit = parseInt(filters.limit);
    }

    if (filters.offset) {
      whereQuery.offset = parseInt(filters.offset);
    }

    let order;
    if (filters.order) {
      switch (filters.order) {
        case "oldest":
          order = [["updated_at", "ASC"]];
          break;
        case "newest":
          order = [["updated_at", "DESC"]];
          break;
        case "a-z":
          order = [["name", "ASC"]];
          break;
        case "z-a":
          order = [["name", "DESC"]];
        default:
          break;
      }

      whereQuery.order = order;
    }
    whereQuery.include = [
      {
        model: this.roleModel,
        as: "role",
        attributes: ["id", "name", "level"],
      },
      {
        model: this.userModel,
        as: "createdBy",
        attributes: ["id", "name", "email"],
      },
      {
        model: this.userModel,
        as: "updatedBy",
        attributes: ["id", "name", "email"],
      },
    ];
    try {
      const users = await this.userModel.findAndCountAll(whereQuery);
      return {
        users: users.rows.map((u) => u.toJSON()),
        total: users.count,
      };
    } catch (error) {
      ctx.log?.error({ error: error.message }, "repo_list_all_users_error");
      // Fallback: get users and roles separately, then join manually
      try {
        delete whereQuery.include;
        const users = await this.userModel.findAndCountAll(whereQuery);

        const RoleModel = this.userModel.sequelize.models.Role;
        if (RoleModel) {
          const roles = await RoleModel.findAll({
            attributes: ["id", "name", "level"],
          });

          // Create a map of roles for quick lookup
          const roleMap = new Map();
          roles.forEach((role) => {
            roleMap.set(role.id, role.toJSON());
          });

          // Add role information to users
          return {
            users: users.rows.map((user) => {
              const userData = user.toJSON();
              const role = roleMap.get(userData.role_id);
              if (role) {
                userData.role = role;
              }
              return userData;
            }),
            total: users.count,
          };
        }

        return {
          users: users.rows.map((u) => u.toJSON()),
          total: users.count,
        };
      } catch (fallbackError) {
        ctx.log?.error(
          { error: fallbackError.message },
          "repo_list_all_users_fallback_error"
        );
        return { users: [], total: 0 };
      }
    }
  }

  async update(id, userData, ctx = {}) {
    ctx.log?.info({ id }, "repo_update_user");
    const user = await this.userModel.findByPk(id);
    if (!user) return null;
    await user.update({
      email: userData.email ?? user.email,
      password: userData.password ?? user.password,
      name: userData.name ?? user.name,
      role_id: userData.roleId ?? user.role_id,
      gender: userData.gender ?? user.gender,
      phone: userData.phone ?? user.phone,
      status: userData.status ?? user.status,
      updated_by: userData.updatedBy ?? user.updated_by,
      updated_at: new Date(),
    });
    return user.toJSON();
  }

  async delete(id, ctx = {}) {
    ctx.log?.info({ id }, "repo_delete_user");
    const deleted = await this.userModel.destroy({ where: { id } });
    return deleted > 0;
  }

  async getUserPermissions(userId, ctx = {}) {
    ctx.log?.info({ userId }, "repo_get_user_permissions");
    const user = await this.userModel.findByPk(userId, {
      include: [
        {
          model: this.userModel.sequelize.models.Role,
          as: "role",
          include: [
            {
              model: this.userModel.sequelize.models.RoleMenuPermission,
              as: "menuPermissions",
              include: [
                {
                  model: this.userModel.sequelize.models.Menu,
                  as: "menu",
                  attributes: [
                    "id",
                    "title",
                    "url",
                    "icon",
                    "parent_id",
                    "order",
                    "is_active",
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user || !user.role) {
      return [];
    }

    // Extract permissions from role
    const permissions =
      user.role.menuPermissions?.map((perm) => ({
        menu_id: perm.menu.id,
        can_view: perm.can_view,
        can_create: perm.can_create,
        can_update: perm.can_update,
        can_delete: perm.can_delete,
        can_confirm: perm.can_confirm,
      })) || [];

    return permissions;
  }

  async getUserSidebar(userId, ctx = {}) {
    ctx.log?.info({ userId }, "repo_get_user_sidebar");
    const user = await this.userModel.findByPk(userId, {
      include: [
        {
          model: this.userModel.sequelize.models.Role,
          as: "role",
          include: [
            {
              model: this.userModel.sequelize.models.RoleMenuPermission,
              as: "menuPermissions",
            },
          ],
        },
      ],
    });

    if (!user || !user.role) {
      return [];
    }

    // Extract permissions from role
    const permissions =
      user.role.menuPermissions?.map((perm) => ({
        menu_id: perm.menu.id,
        can_view: perm.can_view,
        can_create: perm.can_create,
        can_update: perm.can_update,
        can_delete: perm.can_delete,
        can_confirm: perm.can_confirm,
      })) || [];

    return permissions;
  }
}

module.exports = UserRepository;
