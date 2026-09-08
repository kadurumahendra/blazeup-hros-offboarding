import { errorResponse } from '../utils/responseHandler.js';
import { ROLES } from '../models/User.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    // SUPER_ADMIN has access to everything
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`,
        'FORBIDDEN',
        403
      );
    }

    next();
  };
};
