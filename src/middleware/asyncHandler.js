/**
 * Async error handler wrapper
 * 
 * Wraps async route handlers to automatically catch unhandled promise rejections
 * and pass them to Express's error handling middleware.
 * 
 * Without this, unhandled promise rejections in async route handlers will cause
 * FUNCTION_INVOCATION_FAILED errors on Vercel.
 * 
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => {
 *     await someAsyncOperation();
 *     res.json({ success: true });
 *   }));
 */
function asyncHandler(fn) {
  return function(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };

