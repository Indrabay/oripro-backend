const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginUseCase {
  constructor({ userRepository, jwtSecret, tokenTtl = '1h' }) {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
    this.tokenTtl = tokenTtl;
  }

  async execute({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { ok: false, status: 401, error: 'Invalid credentials' };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
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

    return {
      ok: true,
      status: 200,
      data: {
        token,
        user: user.toJSON()
      }
    };
  }
}

module.exports = { LoginUseCase };


