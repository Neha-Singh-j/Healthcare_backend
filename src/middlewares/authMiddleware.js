const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const { sendError } = require('../utils/apiResponse');

/**
 * Authentication middleware to verify JWT token and attach user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header (Bearer <token> or raw token)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else {
        token = authHeader.trim();
      }
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'].trim();
    }

    if (!token) {
      return sendError(
        res,
        'Access denied. No authentication token provided.',
        401
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Authentication token has expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid authentication token.', 401);
    }

    // Verify that user still exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) {
      return sendError(res, 'User belonging to this token no longer exists.', 401);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return sendError(res, 'Authentication failed due to an internal error.', 500);
  }
};

module.exports = {
  verifyToken
};
