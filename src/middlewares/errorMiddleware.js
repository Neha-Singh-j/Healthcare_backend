const { sendError } = require('../utils/apiResponse');

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  return sendError(res, `Resource not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Global Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Prisma unique constraint violation (e.g., P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` (${err.meta.target})` : '';
    return sendError(res, `A record with this unique value already exists${target}.`, 409);
  }

  // Prisma record not found (e.g., P2025)
  if (err.code === 'P2025') {
    return sendError(res, 'Requested record was not found.', 404);
  }

  // Prisma foreign key constraint failure (e.g., P2003)
  if (err.code === 'P2003') {
    return sendError(res, 'Foreign key constraint failed. Related record does not exist.', 400);
  }

  // JSON parse error in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Invalid JSON payload provided.', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred.';

  return sendError(res, message, statusCode);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
