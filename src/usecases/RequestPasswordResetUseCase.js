const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/Mailer');

class RequestPasswordResetUseCase {
  constructor({ userRepository, tokenRepository, appBaseUrl }) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
    this.appBaseUrl = appBaseUrl;
  }

  async execute({ email }, ctx = {}) {
    ctx.log?.info({ email }, 'usecase_request_password_reset_start');
    const user = await this.userRepository.findByEmail(email, ctx);
    if (!user) {
      // Silently succeed to avoid user enumeration
      ctx.log?.warn({ email }, 'usecase_request_password_reset_user_not_found');
      return { ok: true };
    }

    // Invalidate old tokens
    await this.tokenRepository.deleteAllForUser(user.id, ctx);

    // Create token
    const tokenPlain = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenPlain).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await this.tokenRepository.createToken({ userId: user.id, tokenHash, expiresAt }, ctx);
    ctx.log?.info({ userId: user.id }, 'usecase_request_password_reset_token_created');

    const resetUrl = `${this.appBaseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(tokenPlain)}&uid=${encodeURIComponent(user.id)}`;
    await sendPasswordResetEmail({ to: user.email, resetUrl });
    ctx.log?.info({ userId: user.id }, 'usecase_request_password_reset_email_sent');
    return { ok: true };
  }
}

module.exports = { RequestPasswordResetUseCase };


