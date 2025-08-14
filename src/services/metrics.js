const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

register.registerMetric(httpRequestDurationSeconds);

function metricsMiddleware(req, res, next) {
  if (process.env.METRICS_ENABLED !== 'true') return next();
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    const route = req.route && req.route.path ? req.baseUrl + req.route.path : req.originalUrl || req.url;
    end({ method: req.method, route, status: String(res.statusCode) });
  });
  next();
}

async function metricsHandler(_req, res) {
  if (process.env.METRICS_ENABLED !== 'true') return res.status(404).json({ message: 'Not Found' });
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

module.exports = { register, metricsMiddleware, metricsHandler };


