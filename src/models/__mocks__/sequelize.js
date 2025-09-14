const mockSequelize = {
  authenticate: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockResolvedValue([[/* mock rows */], {}]),
  define: jest.fn(),
  sync: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
  transaction: jest.fn().mockImplementation(() => ({
    commit: jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
  })),
  // You can add other methods you need here
};

module.exports = mockSequelize;