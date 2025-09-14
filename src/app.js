const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const auth = require('./routes/auth');
const asset = require('./routes/assets');
const user = require('./routes/users');
const tenant = require('./routes/tenants');
const { requestContext } = require('./middleware/requestContext');
const { metricsMiddleware, metricsHandler } = require('./services/metrics');

const app = express();
const { UserRepository } = require('./repositories/UserRepository');
const { PasswordResetTokenRepository } = require('./repositories/PasswordResetTokenRepository');
const { AssetRepository } = require('./repositories/AssetRepository');
const TenantRepository = require('./repositories/TenantRepository');

const authUc = require('./usecases/AuthUsecase');
const assetUc = require('./usecases/AssetUsecase');
const userUc = require('./usecases/UserUsecase');
const tenantUc = require('./usecases/TenantUsecase');

const userRepository = new UserRepository();
const tokenRepository = new PasswordResetTokenRepository();
const assertRepository = new AssetRepository();
const tenantRepository = new TenantRepository();

const assetUsecase = new assetUc(assertRepository);
const authUsecase = new authUc(
  userRepository,
  process.env.JWT_SECRET,
  process.env.TOKEN_TTL || '1h',
  process.env.APP_BASE_URL || 'http://localhost:3000',
  tokenRepository
);
const userUsecase = new userUc(userRepository);
const tenantUsecase = new tenantUc(tenantRepository);

const authRouter = auth.InitAuthRouter(authUsecase);
const assetRouter = asset.InitAssetRouter(assetUsecase);
const userRouter = user.InitUserRouter(userUsecase);
const tenantRouter = tenant.InitTenantRouter(tenantUsecase);

// Middleware
app.use(helmet());
app.use(cors());
app.use(requestContext);
app.use(metricsMiddleware);
app.use(express.json());
app.use(
  morgan((tokens, req, res) => {
    const rid = req.requestId || '-';
    return JSON.stringify({
      ts: new Date().toISOString(),
      level: 'http',
      requestId: rid,
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      request: req.body,
      length: tokens.res(req, res, 'content-length'),
      responseMs: Number(tokens['response-time'](req, res))
    });
  })
);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/assets', assetRouter);
app.use('/api/users', userRouter);
app.use('/api/tenants', tenantRouter);
app.get('/metrics', metricsHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = app;


