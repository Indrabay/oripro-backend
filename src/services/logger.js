const { pushLog } = require('./loki');

function formatLog(level, requestId, message, meta) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    requestId,
    msg: message
  };
  if (meta && typeof meta === 'object') {
    Object.assign(payload, meta);
  }
  return JSON.stringify(payload);
}

function createLogger(requestId) {
  const safeRequestId = requestId || 'no-req-id';
  return {
    debug(meta, message) {
      if (typeof meta === 'string') {
        const line = formatLog('debug', safeRequestId, meta);
        pushLog('debug', safeRequestId, meta);
        return console.debug(line);
      }
      const line = formatLog('debug', safeRequestId, message, meta);
      pushLog('debug', safeRequestId, message, meta);
      return console.debug(line);
    },
    info(meta, message) {
      if (typeof meta === 'string') {
        const line = formatLog('info', safeRequestId, meta);
        pushLog('info', safeRequestId, meta);
        return console.info(line);
      }
      const line = formatLog('info', safeRequestId, message, meta);
      pushLog('info', safeRequestId, message, meta);
      return console.info(line);
    },
    warn(meta, message) {
      if (typeof meta === 'string') {
        const line = formatLog('warn', safeRequestId, meta);
        pushLog('warn', safeRequestId, meta);
        return console.warn(line);
      }
      const line = formatLog('warn', safeRequestId, message, meta);
      pushLog('warn', safeRequestId, message, meta);
      return console.warn(line);
    },
    error(meta, message) {
      if (typeof meta === 'string') {
        const line = formatLog('error', safeRequestId, meta);
        pushLog('error', safeRequestId, meta);
        return console.error(line);
      }
      const line = formatLog('error', safeRequestId, message, meta);
      pushLog('error', safeRequestId, message, meta);
      return console.error(line);
    }
  };
}

module.exports = { createLogger };


