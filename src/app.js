const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const auth = require('./routes/auth');
const asset = require('./routes/assets');
const user = require('./routes/users');
const units = require('./routes/units');
const tenant = require('./routes/tenants');
const { InitRoleRouter } = require('./routes/roles');
const { requestContext } = require('./middleware/requestContext');
const { metricsMiddleware, metricsHandler } = require('./services/metrics');

const app = express();
const UserRepository = require('./repositories/User');
const PasswordResetTokenRepository = require('./repositories/PasswordResetToken');
const AssetRepository = require('./repositories/Asset');
const AssetLogRepository = require('./repositories/AssetLog');
const UnitRepository = require('./repositories/Unit');
const RoleRepository = require('./repositories/Role');
const TenantRepository = require('./repositories/Tenant');

const authUc = require('./usecases/Auth');
const assetUc = require('./usecases/Asset');
const userUc = require('./usecases/User');
const unitUc = require('./usecases/Unit');
const tenantUc = require('./usecases/Tenant');
const roleUc = require('./usecases/Role');

const modelUser = require('./models/User');
const modelRole = require('./models/Role');
const {Asset} = require('./models/Asset');
const modelAssetLog = require('./models/AssetLog');
const modelUnit = require('./models/Unit');
const modelAdminAsset = require('./models/AssetAdmin');
const modelPasswordResetToken = require('./models/PasswordResetToken');
const modelTenant = require('./models/Tenant');


const userRepository = new UserRepository(modelUser);
const tokenRepository = new PasswordResetTokenRepository(modelPasswordResetToken);
const assetRepository = new AssetRepository(Asset, modelAdminAsset);
const assetLogRepository = new AssetLogRepository(modelAssetLog);
const unitRepository = new UnitRepository(modelUnit);
const roleRepository = new RoleRepository(modelRole);
const tenantRepository = new TenantRepository(modelTenant);

const assetUsecase = new assetUc(assetRepository, assetLogRepository);
const authUsecase = new authUc(
  userRepository,
  process.env.JWT_SECRET,
  process.env.TOKEN_TTL || '1h',
  process.env.APP_BASE_URL || 'http://localhost:3000',
  tokenRepository,
  roleRepository
);
const userUsecase = new userUc(userRepository);
const unitUsecase = new unitUc(unitRepository);
const tenantUsecase = new tenantUc(tenantRepository);
const roleUsecase = new roleUc(roleRepository);

const authRouter = auth.InitAuthRouter(authUsecase);
const assetRouter = asset.InitAssetRouter(assetUsecase);
const userRouter = user.InitUserRouter(userUsecase);
const unitRouter = units.InitUnitRouter(unitUsecase);
const tenantRouter = tenant.InitTenantRouter(tenantUsecase);
const roleRouter = InitRoleRouter(roleUsecase);

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
app.use('/api/units', unitRouter);
app.use('/api/tenants', tenantRouter);
app.use('/api/roles', roleRouter);
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


