const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { PostgresUserRepository } = require('../repositories/PostgresUserRepository');
const { MySqlUserRepository } = require('../repositories/MySqlUserRepository');
const { LoginUseCase } = require('../usecases/LoginUseCase');

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
    const result = await loginUseCase.execute({ email, password });
    if (!result.ok) {
      return res.status(result.status).json({ message: result.error });
    }
    return res.status(200).json(result.data);
  }
);

module.exports = router;


