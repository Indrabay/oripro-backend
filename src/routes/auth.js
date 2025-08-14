const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { PostgresUserRepository } = require('../repositories/PostgresUserRepository');
const { MySqlUserRepository } = require('../repositories/MySqlUserRepository');
const { LoginUseCase } = require('../usecases/LoginUseCase');
const { PostgresPasswordResetTokenRepository } = require('../repositories/PostgresPasswordResetTokenRepository');
const { MySqlPasswordResetTokenRepository } = require('../repositories/MySqlPasswordResetTokenRepository');
const { RequestPasswordResetUseCase } = require('../usecases/RequestPasswordResetUseCase');
const { ResetPasswordUseCase } = require('../usecases/ResetPasswordUseCase');

function buildUserRepository() {
  const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
  if (dbType === 'mysql') return new MySqlUserRepository();
  return new PostgresUserRepository();
}

const userRepository = buildUserRepository();
const loginUseCase = new LoginUseCase({
  userRepository,
  jwtSecret: process.env.JWT_SECRET,
  tokenTtl: '1h'
});

function buildTokenRepository() {
  const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
  if (dbType === 'mysql') return new MySqlPasswordResetTokenRepository();
  return new PostgresPasswordResetTokenRepository();
}

const tokenRepository = buildTokenRepository();
const requestPasswordResetUseCase = new RequestPasswordResetUseCase({
  userRepository,
  tokenRepository,
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000'
});
const resetPasswordUseCase = new ResetPasswordUseCase({ userRepository, tokenRepository });

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    req.log?.info({ email }, 'route_login');
    const result = await loginUseCase.execute({ email, password }, { requestId: req.requestId, log: req.log });
    if (!result.ok) {
      return res.status(result.status).json({ message: result.error });
    }
    return res.status(200).json(result.data);
  }
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    req.log?.info({ email }, 'route_forgot_password');
    await requestPasswordResetUseCase.execute({ email }, { requestId: req.requestId, log: req.log });
    // Always 200 to avoid enumeration
    return res.status(200).json({ message: 'If that email exists, a reset link was sent' });
  }
);

router.post(
  '/reset-password',
  [
    body('uid').isString().notEmpty(),
    body('token').isString().notEmpty(),
    body('newPassword').isString().isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { uid, token, newPassword } = req.body;
    req.log?.info({ uid }, 'route_reset_password');
    const result = await resetPasswordUseCase.execute({ userId: uid, token, newPassword }, { requestId: req.requestId, log: req.log });
    if (!result.ok) {
      return res.status(result.status || 400).json({ message: result.error });
    }
    return res.status(200).json({ message: 'Password updated' });
  }
);

module.exports = router;


