class PasswordResetTokenRepository {
  constructor(prtModel) {
    this.prtModel = prtModel;
  }

  async createToken({ userId, tokenHash, expiresAt }, ctx = {}) {
    ctx.log?.debug({ userId }, 'repo_prt_create_token');
    const token = await this.prtModel.create({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt
    });
    return token.toJSON();
  }

  async findValidByTokenHash(tokenHash, ctx = {}) {
    ctx.log?.debug({}, 'repo_prt_find_valid_by_hash');
    const token = await this.prtModel.findOne({
      where: {
        token_hash: tokenHash,
        used_at: null,
        expires_at: { [require('sequelize').Op.gt]: new Date() }
      }
    });
    return token ? token.toJSON() : null;
  }

  async markUsed(id, ctx = {}) {
    ctx.log?.debug({ id }, 'repo_prt_mark_used');
    const token = await this.prtModel.findByPk(id);
    if (token) await token.update({ used_at: new Date() });
  }

  async deleteAllForUser(userId, ctx = {}) {
    ctx.log?.debug({ userId }, 'repo_prt_delete_all_for_user');
    await this.prtModel.destroy({ where: { user_id: userId } });
  }
}

module.exports = PasswordResetTokenRepository;


