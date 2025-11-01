const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// define routes module
const auth = require('./routes/auth');
const asset = require('./routes/assets');
const user = require('./routes/users');
const units = require('./routes/units');
const tenant = require('./routes/tenants');
const taskRoute = require('./routes/tasks');
const uploadsRouter = require('./routes/uploads');
const { InitAttendanceRouter } = require('./routes/attendances');
const { InitRoleRouter } = require('./routes/roles');
const { InitMenuRouter } = require('./routes/menus');
const { InitScanInfoRouter } = require('./routes/scanInfos');
const { requestContext } = require('./middleware/requestContext');
const { metricsMiddleware, metricsHandler } = require('./services/metrics');

const app = express();
// define repository module
const UserRepository = require('./repositories/User');
const PasswordResetTokenRepository = require('./repositories/PasswordResetToken');
const AssetRepository = require('./repositories/Asset');
const AssetLogRepository = require('./repositories/AssetLog');
const UnitRepository = require('./repositories/Unit');
const RoleRepository = require('./repositories/Role');
const TenantRepository = require('./repositories/Tenant');
const TenantAttachmentRepository = require('./repositories/TenantAttachment');
const MapTenantCategoryRepository = require('./repositories/MapTenantCategory');
const TenantUnitRepository = require('./repositories/TenantUnit');
const MenuRepository = require('./repositories/Menu');
const AssetAttachmentRepository = require('./repositories/AssetAttachment');
const UnitAttachmentRepository = require('./repositories/UnitAttachment');
const TenantCategoryRepository = require('./repositories/TenantCategory');
const UserAccessMenuRepository = require('./repositories/UserAccessMenu');
const UserLogRepository = require('./repositories/UserLog');
const UnitLogRepository = require('./repositories/UnitLog');
const TenantLogRepository = require('./repositories/TenantLog');
const AttendanceRepository = require('./repositories/Attendance');
const UserAssetRepository = require('./repositories/UserAsset');
const TaskRepository = require('./repositories/Task');
const TaskScheduleRepository = require('./repositories/TaskSchedule');
const TaskLogRepository = require('./repositories/TaskLog');
const ScanInfoRepository = require('./repositories/ScanInfo');
const UserTaskRepository = require('./repositories/UserTask');
const UserTaskEvidenceRepository = require('./repositories/UserTaskEvidence');

// define usecase module
const authUc = require('./usecases/Auth');
const assetUc = require('./usecases/Asset');
const userUc = require('./usecases/User');
const unitUc = require('./usecases/Unit');
const tenantUc = require('./usecases/Tenant');
const roleUc = require('./usecases/Role');
const menuUc = require('./usecases/Menu');
const userAccessMenuUc = require('./usecases/UserAccessMenu');
const taskUc = require('./usecases/Task');
const userTaskUc = require('./usecases/UserTask');
const scanInfoUc = require('./usecases/ScanInfo');
const attendanceUc = require('./usecases/Attendance');

// define models database
const {User} = require('./models/User');
const modelRole = require('./models/Role');
const {Asset} = require('./models/Asset');
const modelAssetLog = require('./models/AssetLog');
const modelUnit = require('./models/Unit');
const modelAdminAsset = require('./models/AssetAdmin');
const modelPasswordResetToken = require('./models/PasswordResetToken');
const { Tenant } = require('./models/Tenant');
const {TenantAttachmentModel} = require('./models/TenantAttachment');
const MapTenantCategory = require('./models/MapTenantCategory');
const modelTenantUnit = require('./models/TenantUnit');
const modelMenu = require('./models/Menu');
const modelRoleMenuPermission = require('./models/RoleMenuPermission');
const { AssetAttachment } = require('./models/AssetAttachment');
const modelUnitAttachment = require('./models/UnitAttachment');
const modelTenantCategory = require('./models/TenantCategory');
const modelUserLog = require('./models/UserLog');
const modelUnitLog = require('./models/UnitLog');
const modelTenantLog = require('./models/TenantLog');
const modelUserAsset = require('./models/UserAsset');
const modelTask = require('./models/Task');
const modelTaskSchedule = require('./models/TaskSchedule');
const modelTaskLog = require('./models/TaskLog');
const modelScanInfo = require('./models/ScanInfo');
const modelUserTask = require('./models/UserTask');
const modelUserTaskEvidence = require('./models/UserTaskEvidence');

// initialize repository
const userRepository = new UserRepository(User, modelRole);
const tokenRepository = new PasswordResetTokenRepository(modelPasswordResetToken);
const assetRepository = new AssetRepository(Asset, modelAdminAsset, User);
const assetLogRepository = new AssetLogRepository(modelAssetLog, User);
const unitRepository = new UnitRepository(modelUnit, Asset, User);
const roleRepository = new RoleRepository(modelRole, modelRoleMenuPermission);
const tenantRepository = new TenantRepository(Tenant, User);
const tenantAttachmentRepository = new TenantAttachmentRepository(TenantAttachmentModel)
const mapTenantCategoryRepository = new MapTenantCategoryRepository(MapTenantCategory)
const tenantUnitRepository = new TenantUnitRepository(modelTenantUnit)
const menuRepository = new MenuRepository(modelMenu)
const assetAttachmentRepository = new AssetAttachmentRepository(AssetAttachment);
const unitAttachmentRepository = new UnitAttachmentRepository(modelUnitAttachment);
const tenantCategoryRepository = new TenantCategoryRepository(modelTenantCategory);
const userAccessMenuRepository = new UserAccessMenuRepository(User, modelRole, modelRoleMenuPermission, modelMenu);
const userLogRepository = new UserLogRepository(modelUserLog, User, modelRole)
const unitLogRepository = new UnitLogRepository(modelUnitLog, User)
const tenantLogRepository = new TenantLogRepository(modelTenantLog, User);
const userAssetRepository = new UserAssetRepository(modelUserAsset);
const taskRepository = new TaskRepository(modelTask, User, modelRole, Asset);
const taskScheduleRepository = new TaskScheduleRepository(modelTaskSchedule);
const taskLogRepository = new TaskLogRepository(modelTaskLog, User);
const scanInfoRepository = new ScanInfoRepository(modelScanInfo, User, Asset);
const userTaskRepository = new UserTaskRepository(modelUserTask, User, modelTask, modelUserTaskEvidence, modelTaskSchedule);
const userTaskEvidenceRepository = new UserTaskEvidenceRepository(modelUserTaskEvidence, modelUserTask);

// Setup model associations
const models = {
  User: User,
  Role: modelRole,
  Menu: modelMenu,
  RoleMenuPermission: modelRoleMenuPermission,
  Asset: Asset,
  AssetLog: modelAssetLog,
  Unit: modelUnit,
  AssetAdmin: modelAdminAsset,
  PasswordResetToken: modelPasswordResetToken,
  Tenant: Tenant,
  TenantAttachment: TenantAttachmentModel,
  MapTenantCategory: MapTenantCategory,
  TenantUnit: modelTenantUnit,
  AssetAttachment: AssetAttachment,
  UnitAttachment: modelUnitAttachment,
  TenantCategory: modelTenantCategory,
  UserLog: modelUserLog,
  UnitLog: modelUnitLog,
  TenantLog: modelTenantLog,
  UserAsset: modelUserAsset,
  Task: modelTask,
  TaskSchedule: modelTaskSchedule,
  TaskLog: modelTaskLog,
  ScanInfo: modelScanInfo,
  UserTask: modelUserTask,
  UserTaskEvidence: modelUserTaskEvidence,
};

// Setup associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// initialize usecase
const assetUsecase = new assetUc(assetRepository, assetLogRepository, assetAttachmentRepository, unitRepository);
const authUsecase = new authUc(
  userRepository,
  process.env.JWT_SECRET,
  process.env.TOKEN_TTL || '1h',
  process.env.APP_BASE_URL || 'http://localhost:3000',
  tokenRepository,
  roleRepository,
  userAssetRepository,
);
const userUsecase = new userUc(userRepository, userLogRepository, userAssetRepository);
const unitUsecase = new unitUc(unitRepository, unitAttachmentRepository, unitLogRepository);
const tenantUsecase = new tenantUc(tenantRepository, tenantAttachmentRepository, tenantUnitRepository, mapTenantCategoryRepository, tenantCategoryRepository, unitRepository, tenantLogRepository, userUsecase);
const roleUsecase = new roleUc(roleRepository);
const menuUsecase = new menuUc(menuRepository);
const userAccessMenuUsecase = new userAccessMenuUc(userAccessMenuRepository);
const taskUsecase = new taskUc(taskRepository, taskScheduleRepository, taskLogRepository);
const userTaskUsecase = new userTaskUc(userTaskRepository, taskRepository, taskScheduleRepository, userTaskEvidenceRepository);
const scanInfoUsecase = new scanInfoUc(scanInfoRepository);
const attendanceRepository = new AttendanceRepository();
const attendanceUsecase = new attendanceUc(attendanceRepository);

// initalize router
const authRouter = auth.InitAuthRouter(authUsecase);
const assetRouter = asset.InitAssetRouter(assetUsecase);
const userRouter = user.InitUserRouter(userUsecase, userAccessMenuUsecase);
const unitRouter = units.InitUnitRouter(unitUsecase);
const tenantRouter = tenant.InitTenantRouter(tenantUsecase);
const roleRouter = InitRoleRouter(roleUsecase);
const menuRouter = InitMenuRouter(menuUsecase);
const attendanceRouter = InitAttendanceRouter(attendanceUsecase);
const uploadFileRouter = uploadsRouter.InitUploadRouter();
const taskRouter = taskRoute.InitTaskRouter(taskUsecase);
const scanInfoRouter = InitScanInfoRouter(scanInfoUsecase);
const userTaskRouter = require('./routes/userTasks').InitUserTaskRouter(userTaskUsecase);

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
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/assets', assetRouter);
app.use('/api/users', userRouter);
app.use('/api/units', unitRouter);
app.use('/api/tenants', tenantRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/roles', roleRouter);
app.use('/api/menus', menuRouter);
app.use('/api/uploads', uploadFileRouter);
app.use('/api/scan-infos', scanInfoRouter);
app.use('/api/user-tasks', userTaskRouter);

app.use('/api/attendances', attendanceRouter);
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

// Only start server when not running on Vercel
// Vercel serverless functions don't need app.listen()
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
