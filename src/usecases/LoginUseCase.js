const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginUseCase {
  constructor({ userRepository, jwtSecret, tokenTtl = '1h' }) {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
    this.tokenTtl = tokenTtl;
  }

  async execute({ email, password }, ctx = {}) {
    ctx.log?.info({ email }, 'login_attempt');
    const user = await this.userRepository.findByEmail(email, ctx);
    if (!user) {
      ctx.log?.warn({ email }, 'login_invalid_email');
      return { ok: false, status: 401, error: 'Invalid credentials' };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      ctx.log?.warn({ userId: user.id }, 'login_invalid_password');
      return { ok: false, status: 401, error: 'Invalid credentials' };
    }

    if (!this.jwtSecret) {
      return { ok: false, status: 500, error: 'Server misconfiguration: missing JWT_SECRET' };
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roleId: user.roleId
      },
      this.jwtSecret,
      { expiresIn: this.tokenTtl }
    );

    const result = {
      ok: true,
      status: 200,
      data: {
        token,
        user: user.toJSON()
      }
    };
    ctx.log?.info({ userId: user.id }, 'login_success');
    return result;
  }
}

module.exports = { LoginUseCase };


