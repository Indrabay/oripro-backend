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
    ctx.log?.info({ id }, "UserUsecase.getUser");
    const user = await this.userRepository.findById(id, ctx);
    
    if (!user) {
      ctx.log?.warn({ id }, "UserUsecase.getUser_not_found");
      return null;
    }
    
    ctx.log?.info({ id, found: true }, "UserUsecase.getUser_found");
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
      // Create user log with complete user information
      const userLogData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        status: user.status,
        role_id: user.role_id,
        created_at: user.created_at,
        assetIds: data.assetIds || []
      };

      let userLog = {
        user_id: user.id,
        action: 'create',
        old_data: null, // No old data for create
        new_data: userLogData,
        created_by: ctx.userId,
      };

      if (data.assetIds && data.assetIds.length > 0) {
        for (let i = 0; i < data.assetIds.length; i++) {
          if (data.assetIds[i] && data.assetIds[i] !== null && data.assetIds[i] !== undefined) {
            await this.userAssetRepository.create({
              user_id: user.id,
              asset_id: data.assetIds[i],
            }, ctx);
          }
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

      // Create new user assets
      for (const asset of createdAsset) {
        if (asset && asset !== null && asset !== undefined) {
          try {
            await this.userAssetRepository.create({
              user_id: updatedUser.id,
              asset_id: asset
            }, ctx);
            ctx.log?.info({ user_id: updatedUser.id, asset_id: asset }, "UserUsecase.create_user_asset_success");
          } catch (error) {
            ctx.log?.error({ user_id: updatedUser.id, asset_id: asset, error: error.message }, "UserUsecase.create_user_asset_error");
          }
        }
      }

      // Remove deleted user assets
      for (const asset of deletedAsset) {
        if (asset && asset !== null && asset !== undefined) {
          try {
            await this.userAssetRepository.remove({
              user_id: updatedUser.id,
              asset_id: asset
            }, ctx);
            ctx.log?.info({ user_id: updatedUser.id, asset_id: asset }, "UserUsecase.remove_user_asset_success");
          } catch (error) {
            ctx.log?.error({ user_id: updatedUser.id, asset_id: asset, error: error.message }, "UserUsecase.remove_user_asset_error");
          }
        }
      }
    }
    // Create log with only changed fields
    const changedFields = this.getChangedFields(user, updatedUser, data);
    if (Object.keys(changedFields.old_data).length > 0 || Object.keys(changedFields.new_data).length > 0) {
      const userLog = {
        user_id: updatedUser.id,
        action: 'update',
        old_data: changedFields.old_data,
        new_data: changedFields.new_data,
        created_by: ctx.userId,
      };

      await this.userLogRepository.create(userLog, ctx);
    }
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(id, ctx) {
    const user = await this.userRepository.findById(id, ctx);
    if (!user) return null;
    if (user.id === ctx.userId) return "self";
    console.log("delete user")
    
    //Remove user log
    await this.userLogRepository.create({
      user_id: user.id,
      action: 'delete',
      old_data: null,
      new_data: null,
      created_by: ctx.userId,
    }, ctx);

    // Remove all user assets before deleting user
    await this.userAssetRepository.remove({
      user_id: user.id,
    }, ctx);

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
    
    try {
      ctx.log?.info({ userId }, "UserUsecase.getUserLogs_calling_repository");
      const userLogs = await this.userLogRepository.getByUserID(userId, ctx);
      
      ctx.log?.info({ userId, logsCount: userLogs?.length || 0 }, "UserUsecase.getUserLogs_repository_result");
      
      if (!userLogs || userLogs.length === 0) {
        ctx.log?.warn({ userId }, "UserUsecase.getUserLogs_no_logs");
        return [];
      }
      
      const mappedLogs = userLogs.map((ul) => {
        ul.created_by = ul.createdBy;
        delete ul.createdBy;
        return ul;
      });
      
      ctx.log?.info({ userId, mappedLogsCount: mappedLogs.length }, "UserUsecase.getUserLogs_mapped_result");
      return mappedLogs;
    } catch (error) {
      ctx.log?.error({ userId, error: error.message }, "UserUsecase.getUserLogs_error");
      throw error;
    }
  }

  async getUserAssets(userId, ctx) {
    ctx.log?.info({ userId }, "UserUsecase.getUserAssets");
    const userAssets = await this.userAssetRepository.getByUserID(userId, ctx);
    return userAssets.map((ua) => {
      // Format the data for better readability
      const formattedAsset = {
        id: ua.id,
        user_id: ua.user_id,
        asset_id: ua.asset_id,
        created_by: ua.created_by,
        created_at: ua.created_at,
        // Asset information (flattened for easier access)
        asset_name: ua.asset_name,
        asset_code: ua.asset_code,
        asset_address: ua.asset_address,
        asset_type: ua.asset_type,
        asset_status: ua.asset_status,
        // Full asset object for detailed information
        asset: ua.asset
      };
      
      ctx.log?.info({ 
        user_id: userId, 
        asset_id: ua.asset_id, 
        asset_name: ua.asset_name 
      }, "UserUsecase.getUserAssets_processed");
      
      return formattedAsset;
    });
  }

  // Helper method to get only changed fields
  getChangedFields(oldData, newData, inputData) {
    const oldFields = {};
    const newFields = {};
    
    // Fields to track for changes
    const trackableFields = ['name', 'email', 'phone', 'gender', 'status', 'role_id'];
    
    trackableFields.forEach(field => {
      if (inputData[field] !== undefined && oldData[field] !== newData[field]) {
        oldFields[field] = oldData[field];
        newFields[field] = newData[field];
      }
    });

    // Handle password change separately (don't log actual password)
    if (inputData.password) {
      oldFields.password = '[HIDDEN]';
      newFields.password = '[CHANGED]';
    }

    return {
      old_data: oldFields,
      new_data: newFields
    };
  }
}

module.exports = UserUsecase;
