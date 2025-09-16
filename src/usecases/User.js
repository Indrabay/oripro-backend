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
    return userWithoutPassword;
  }

  async createUser(data, ctx) {
    const existingUser = await this.userRepository.findByEmail(data.email, ctx);
    if (existingUser) return 'exists';
    const user = await this.userRepository.create({
      ...data,
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
    const updatedUser = await this.userRepository.update(id, {
      ...data,
      updatedBy: ctx.userId
    }, ctx);
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
}

module.exports = UserUsecase;
