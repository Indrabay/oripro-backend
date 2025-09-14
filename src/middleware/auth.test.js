const jwt = require('jsonwebtoken');
const { authMiddleware } = require('./auth');

describe('authMiddleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "jwt_scret_for_tests";
  });
  afterEach(() => {
    delete process.env.JWT_SECRET;
  });
  it('send empty headers auth', async () => {
    const req = { headers: {} };
    const res = {
      status: (code) => {
        expect(code).toEqual(401);
        return {
          json: (obj) => {
            expect(obj).toHaveProperty('message', 'Unauthorized');
          },
        };
      },
    };
    const next = () => {
      throw new Error('Next should not be called');
    };
    await authMiddleware(req, res, next);
  })
  it('empty token return unauthorized', async () => {
    const token = '';
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {
      status: (code) => {
        expect(code).toEqual(401);
        return {
          json: (obj) => {
            expect(obj).toHaveProperty('message', 'Unauthorized');
          },
        };
      },
    };
    const next = () => {
      throw new Error('Next should not be called');
    };
    await authMiddleware(req, res, next);
  });

  it('will return unauthorized if error occured', async () => {
    const token = jwt.sign({ sub: 'user123', roleId: 'role123', roleName: 'admin' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = () => {
      throw new Error('Error next');
    }
    const res = {
      status: (code) => {
        expect(code).toEqual(401);
        return {
          json: (obj) => {
            expect(obj).toHaveProperty('message', 'Unauthorized');
          },
        };
      },
    };
    
    await authMiddleware(req, res, next);
  });

  it('valid token sets req.auth and calls next', async () => {
    const token = jwt.sign({ sub: 'user123', roleId: 'role123', roleName: 'admin' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` }, requestId: 'req-1', log: console };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };
    const res = {
      status: (code) => {
        throw new Error(`Status should not be called, got ${code}`);
      },
    };
    await authMiddleware(req, res, next);
    expect(nextCalled).toBe(true);
    expect(req).toHaveProperty('auth');
    expect(req.auth).toEqual({ userId: 'user123', roleId: 'role123', roleName: 'admin' });
  });
});