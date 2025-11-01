// Vercel serverless function entry point
// This file exports the Express app as a serverless function handler
const app = require('../src/app');

// Export the Express app as a Vercel serverless function
module.exports = app;

