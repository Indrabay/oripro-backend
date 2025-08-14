const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class ResetPasswordUseCase {
  constructor({ userRepository, tokenRepository }) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
  }

  async execute({ userId, token, newPassword }, ctx = {}) {
    ctx.log?.info({ userId }, 'usecase_reset_password_start');
    // Token is stored as a sha256 digest for deterministic lookup
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRecord = await this.tokenRepository.findValidByTokenHash(tokenHash, ctx);
    if (!tokenRecord || tokenRecord.user_id !== userId) {
      ctx.log?.warn({ userId }, 'usecase_reset_password_invalid_token');
      return { ok: false, status: 400, error: 'Invalid or expired token' };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(userId, passwordHash, ctx);
    await this.tokenRepository.markUsed(tokenRecord.id, ctx);
    ctx.log?.info({ userId }, 'usecase_reset_password_success');
    return { ok: true };
  }
}

module.exports = { ResetPasswordUseCase };


