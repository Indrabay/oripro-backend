const { Router } = require('express');
const { body, validationResult } = require('express-validator');

function InitAuthRouter(authUsecase) {

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
      const result = await authUsecase.login({ email, password }, { requestId: req.requestId, log: req.log });
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
      await authUsecase.forgotPassword({ email }, { requestId: req.requestId, log: req.log });
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
      const result = await authUsecase.resetPassword({ userId: uid, token, newPassword }, { requestId: req.requestId, log: req.log });
      if (!result.ok) {
        return res.status(result.status || 400).json({ message: result.error });
      }
      return res.status(200).json({ message: 'Password updated' });
    }
  );

  return router;
}



module.exports = { InitAuthRouter };


