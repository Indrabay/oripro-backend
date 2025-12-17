const crypto = require('crypto');

function timingSafeEqualStr(a, b) {
  const aBuf = Buffer.from(String(a || ''), 'utf8');
  const bBuf = Buffer.from(String(b || ''), 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function basicAuthFromEnv(options = {}) {
  const realm = options.realm || 'Internal';
  const envUserKey = options.envUserKey || 'INTERNAL_BASIC_AUTH_USER';
  const envPassKey = options.envPassKey || 'INTERNAL_BASIC_AUTH_PASS';

  return function basicAuth(req, res, next) {
    const expectedUser = process.env[envUserKey];
    const expectedPass = process.env[envPassKey];

    if (!expectedUser || !expectedPass) {
      return res.status(500).json({
        message: `Server misconfiguration: missing ${envUserKey}/${envPassKey}`,
      });
    }

    const header = req.headers.authorization || '';
    const [scheme, encoded] = header.split(' ');

    if (scheme !== 'Basic' || !encoded) {
      res.set('WWW-Authenticate', `Basic realm="${realm}"`);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let decoded = '';
    try {
      decoded = Buffer.from(encoded, 'base64').toString('utf8');
    } catch (_e) {
      res.set('WWW-Authenticate', `Basic realm="${realm}"`);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const idx = decoded.indexOf(':');
    const user = idx >= 0 ? decoded.slice(0, idx) : decoded;
    const pass = idx >= 0 ? decoded.slice(idx + 1) : '';

    const okUser = timingSafeEqualStr(user, expectedUser);
    const okPass = timingSafeEqualStr(pass, expectedPass);
    if (!okUser || !okPass) {
      res.set('WWW-Authenticate', `Basic realm="${realm}"`);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return next();
  };
}

module.exports = { basicAuthFromEnv };


