const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const authRouter = require('./routes/auth');
const assetsRouter = require('./routes/assets');
const { requestContext } = require('./middleware/requestContext');
const { metricsMiddleware, metricsHandler } = require('./services/metrics');

const app = express();

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
app.use('/api/assets', assetsRouter);
app.get('/metrics', metricsHandler);

// 404 handler
app.use((req, res) => {
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


