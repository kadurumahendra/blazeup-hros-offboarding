import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { errorResponse } from '../utils/responseHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return errorResponse(res, 'Authentication token missing or invalid', 'UNAUTHORIZED', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return errorResponse(res, 'User account not found or deactivated', 'UNAUTHORIZED', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session token expired. Please login again.', 'TOKEN_EXPIRED', 401);
    }
    return errorResponse(res, 'Invalid authentication token', 'UNAUTHORIZED', 401);
  }
};
