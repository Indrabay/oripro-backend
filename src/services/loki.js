// Minimal Loki HTTP push client using global fetch (Node >=18)

function getLokiConfig() {
  return {
    enabled: process.env.LOKI_ENABLED === 'true',
    url: process.env.LOKI_URL || 'http://localhost:3100',
    tenantId: process.env.LOKI_TENANT_ID || undefined,
    basicUser: process.env.LOKI_BASIC_AUTH_USER || undefined,
    basicPass: process.env.LOKI_BASIC_AUTH_PASSWORD || undefined,
    app: process.env.LOKI_APP || 'oripro-backend',
    env: process.env.APP_ENV || process.env.NODE_ENV || 'development'
  };
}

async function pushLog(level, requestId, message, meta) {
  const cfg = getLokiConfig();
  if (!cfg.enabled) return;
  try {
    const tsNs = String(BigInt(Date.now()) * 1000000n);
    const labels = {
      app: cfg.app,
      level,
      env: cfg.env,
      request_id: requestId || 'no-req-id'
    };
    const lineObj = { ts: new Date().toISOString(), level, requestId, msg: message, ...meta };
    const body = {
      streams: [
        {
          stream: labels,
          values: [[tsNs, JSON.stringify(lineObj)]]
        }
      ]
    };
    const headers = { 'Content-Type': 'application/json' };
    if (cfg.tenantId) headers['X-Scope-OrgID'] = cfg.tenantId;
    if (cfg.basicUser && cfg.basicPass) {
      const token = Buffer.from(`${cfg.basicUser}:${cfg.basicPass}`).toString('base64');
      headers.Authorization = `Basic ${token}`;
    }
    const endpoint = cfg.url.replace(/\/$/, '') + '/loki/api/v1/push';
    // Fire-and-forget
    fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) }).catch(() => {});
  } catch (_) {
    // swallow
  }
}

module.exports = { pushLog };


