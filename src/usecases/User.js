const bcrypt = require("bcryptjs");
const {
  UserGenderStrToInt,
  UserGenderIntToStr,
  UserStatusIntToStr,
  UserStatusStrToInt,
} = require("../models/User");

class UserUsecase {
  constructor(userRepository, userLogRepository, userAssetRepository) {
    this.userRepository = userRepository;
    this.userLogRepository = userLogRepository;
    this.userAssetRepository = userAssetRepository;
  }
  async listUsers(filters, ctx) {
    ctx.log?.info({}, "usecase_list_users");
    if (ctx.roleName === "super_admin") {
      const data = await this.userRepository.listAll(filters, ctx);
      return {
        users: data.users.map((user) => {
          const { password, ...userWithoutPassword } = user;
          userWithoutPassword.gender =
            UserGenderIntToStr[userWithoutPassword.gender];
          userWithoutPassword.status =
            UserStatusIntToStr[userWithoutPassword.status];
          userWithoutPassword.created_by = userWithoutPassword.createdBy;
          userWithoutPassword.updated_by = userWithoutPassword.updatedBy;

          delete userWithoutPassword.createdBy;
          delete userWithoutPassword.updatedBy;
          return userWithoutPassword;
        }),
        total: data.total,
      };
    }
    return "forbidden";
  }

  async getUser(id, ctx) {
    const user = await this.userRepository.findById(id, ctx);
    if (!user) return null;
    // Add admin logic if needed
    const { password, ...userWithoutPassword } = user;
    userWithoutPassword.gender = UserGenderIntToStr[userWithoutPassword.gender];
    userWithoutPassword.status = UserStatusIntToStr[userWithoutPassword.status];
    userWithoutPassword.created_by = userWithoutPassword.createdBy;
    userWithoutPassword.updated_by = userWithoutPassword.updatedBy;

    const userAssets = await this.userAssetRepository.getByUserID(user.id, ctx);
    userWithoutPassword.assetIds = userAssets.map(ua => ua.asset_id);

    delete userWithoutPassword.createdBy;
    delete userWithoutPassword.updatedBy;
    return userWithoutPassword;
  }

  async createUser(data, ctx) {
    const existingUser = await this.userRepository.findByEmail(data.email, ctx);
    if (existingUser) return "exists";

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(data.password, 10);

    data.gender = UserGenderStrToInt[data.gender];
    data.status = UserStatusStrToInt[data.status];

    const user = await this.userRepository.create(
      {
        ...data,
        password: hashedPassword,
        createdBy: ctx.userId,
      },
      ctx
    );

    if (user) {
      let userLog = {
        user_id: user.id,
        email: user.email,
        gender: user.gender,
        phone: user.phone,
        password: user.password,
        name: user.name,
        role_id: user.role_id,
        status: user.status,
        created_by: ctx.userId,
      };

      if (data.assetIds && data.assetIds.length > 0) {
        for (let i = 0; i < data.assetIds.length; i++) {
          await this.userAssetRepository.create({
            user_id: user.id,
            asset_id: data.assetIds[i],
          }, ctx);
        }
      }

      await this.userLogRepository.create(userLog, ctx);
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id, data, ctx) {
    const user = await this.userRepository.findById(id, ctx);
    if (!user) return null;
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(
        data.email,
        ctx
      );
      if (existingUser) return "exists";
    }

    if (data.gender) {
      data.gender = UserGenderStrToInt[data.gender];
    }

    if (data.status) {
      data.status = UserStatusStrToInt[data.status];
    }

    // Hash password if it's being updated
    const updateData = { ...data, updatedBy: ctx.userId };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, updateData, ctx);
    if (!updatedUser) return null;
    if (data.assetIds && data.assetIds.length > 0) {
      let userAssets = await this.userAssetRepository.getByUserID(updatedUser.id, ctx);
      let asset_ids = userAssets.map(ua => ua.asset_id);
      let deletedAsset = []
      let createdAsset = []
      for (let i = 0; i < asset_ids.length; i++) {
        if (!data.assetIds.includes(asset_ids[i])) {
          deletedAsset.push(asset_ids[i])
        }
      }

      for (let i = 0; i < data.assetIds.length; i++) {
        if (!asset_ids.includes(data.assetIds[i])) {
          createdAsset.push(data.assetIds[i])
        }
      }

      createdAsset.forEach(async (asset) => {
        await this.userAssetRepository.create({
          user_id: updatedUser.id,
          asset_id: asset
        }, ctx);
      })

      deletedAsset.forEach(async (asset) => {
        await this.userAssetRepository.remove({
          user_id: updatedUser.id,
          asset_id: asset
        }, ctx);
      })
    }
    const userLog = {
      user_id: updatedUser.id,
      email: updatedUser.email,
      gender: updatedUser.gender,
      phone: updatedUser.phone,
      password: updatedUser.password,
      name: updatedUser.name,
      role_id: updatedUser.role_id,
      status: updatedUser.status,
      created_by: ctx.userId,
    };

    await this.userLogRepository.create(userLog, ctx);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(id, ctx) {
    const user = await this.userRepository.findById(id, ctx);
    if (!user) return null;
    if (user.id === ctx.userId) return "self";
    const deleted = await this.userRepository.delete(id, ctx);
    return deleted;
  }

  async getUserPermissions(userId, ctx) {
    ctx.log?.info({ userId }, "usecase_get_user_permissions");
    const permissions = await this.userRepository.getUserPermissions(
      userId,
      ctx
    );
    return permissions;
  }

  async getUserMenus(userId, ctx) {
    ctx.log?.info({ userId }, "usecase_get_user_menus");
    const menus = await this.userRepository.getUserMenus(userId, ctx);
    return menus;
  }

  async getUserSidebar(userId, ctx) {
    ctx.log?.info({ userId }, "usecase_get_user_sidebar");
    const sidebar = await this.userRepository.getUserSidebar(userId, ctx);
    return sidebar;
  }

  async getUserLogs(userId, ctx) {
    ctx.log?.info({ userId }, "UserUsecase.getUserLogs");
    const userLogs = await this.userLogRepository.getByUserID(userId, ctx);
    return userLogs.map((ul) => {
      ul.created_by = ul.createdBy;
      ul.status = UserStatusIntToStr[ul.status];
      ul.gender = UserGenderIntToStr[ul.gender];
      delete ul.createdBy;
      return ul;
    });
  }
}

module.exports = UserUsecase;
