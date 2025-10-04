const bcrypt = require('bcryptjs');
const { UserGenderStrToInt, UserGenderIntToStr } = require('../models/User');

class UserUsecase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async listUsers(ctx) {
    ctx.log?.info({}, 'usecase_list_users');
    if (ctx.roleName === 'super_admin') {
      const users = await this.userRepository.listAll(ctx);
      return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        userWithoutPassword.gender = UserGenderIntToStr[userWithoutPassword.gender]
        return userWithoutPassword;
      });
    }
    return 'forbidden';
  }

  async getUser(id, ctx) {
    const user = await this.userRepository.findById(id, ctx);
    if (!user) return null;
    // Add admin logic if needed
    const { password, ...userWithoutPassword } = user;
    userWithoutPassword.gender = UserGenderIntToStr[userWithoutPassword.gender]
    return userWithoutPassword;
  }

  async createUser(data, ctx) {
    const existingUser = await this.userRepository.findByEmail(data.email, ctx);
    if (existingUser) return 'exists';
    
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(data.password, 10);

    data.gender = UserGenderStrToInt[data.gender]
    
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
      createdBy: ctx.userId
    }, ctx);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id, data, ctx) {
    const user = await this.userRepository.findById(id, ctx);
    if (!user) return null;
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(data.email, ctx);
      if (existingUser) return 'exists';
    }

    if (data.gender) {
      data.gender = UserGenderStrToInt[data.gender]
    }
    
    // Hash password if it's being updated
    const updateData = { ...data, updatedBy: ctx.userId };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    const updatedUser = await this.userRepository.update(id, updateData, ctx);
    if (!updatedUser) return null;
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(id, ctx) {
    const user = await this.userRepository.findById(id, ctx);
    if (!user) return null;
    if (user.id === ctx.userId) return 'self';
    const deleted = await this.userRepository.delete(id, ctx);
    return deleted;
  }

  async getUserPermissions(userId, ctx) {
    ctx.log?.info({ userId }, 'usecase_get_user_permissions');
    const permissions = await this.userRepository.getUserPermissions(userId, ctx);
    return permissions;
  }

  async getUserMenus(userId, ctx) {
    ctx.log?.info({ userId }, 'usecase_get_user_menus');
    const menus = await this.userRepository.getUserMenus(userId, ctx);
    return menus;
  }

  async getUserSidebar(userId, ctx) {
    ctx.log?.info({ userId }, 'usecase_get_user_sidebar');
    const sidebar = await this.userRepository.getUserSidebar(userId, ctx);
    return sidebar;
  }
}

module.exports = UserUsecase;
