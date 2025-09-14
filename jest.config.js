// jest.config.js
module.exports = {
  // ... other Jest configurations
  coverageDirectory: './custom-coverage-reports',
  coverageReporters: ['json', 'lcov', 'text-summary'],
};