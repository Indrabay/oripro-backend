const runMigrations = require('./runMigrations');
jest.mock('../src/models/sequelize')
const sequelize = require('../src/models/sequelize');

// Create a mock sequelize instance (in-memory SQLite)

describe('runMigrations', () => {
  it('should sync all models without error', async () => {
    // Mock sequelize.sync and sequelize.close
    const syncMock = jest.spyOn(sequelize, 'sync').mockResolvedValue();
    const closeMock = jest.spyOn(sequelize, 'close').mockResolvedValue();

    await expect(runMigrations(sequelize)).resolves.not.toThrow();

    expect(syncMock).toHaveBeenCalledWith({ alter: true });
    expect(closeMock).toHaveBeenCalled();

    syncMock.mockRestore();
    closeMock.mockRestore();
  });

  it('should handle migration errors', async () => {
    jest.mock('sequelize', () => {
      const mSequelize = {
        authenticate: jest.fn(),
        define: jest.fn(),
      };
      return { Sequelize: jest.fn(() => mSequelize) };
    });
    const syncMock = jest.spyOn(sequelize, 'sync').mockRejectedValue(new Error('Sync error'));
    const closeMock = jest.spyOn(sequelize, 'close').mockResolvedValue();

    // Suppress console.error output
    jest.spyOn(console, 'error').mockImplementation(() => { });
    const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => { });

    await runMigrations(sequelize);

    expect(syncMock).toHaveBeenCalled();
    expect(exitMock).toHaveBeenCalledWith(1);

    syncMock.mockRestore();
    closeMock.mockRestore();
    exitMock.mockRestore();
    console.error.mockRestore();
  });
});