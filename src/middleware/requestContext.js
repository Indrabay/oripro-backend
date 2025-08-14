const { randomUUID } = require('crypto');
const { createLogger } = require('../services/logger');

function requestContext(req, res, next) {
  const incomingId = req.headers['x-request-id'];
  const requestId = typeof incomingId === 'string' && incomingId.trim() ? incomingId : randomUUID();
  req.requestId = requestId;
  req.log = createLogger(requestId);
  res.setHeader('x-request-id', requestId);
  next();
}

module.exports = { requestContext };


