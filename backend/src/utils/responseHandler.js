export const successResponse = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message = 'Error', error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || message
  });
};

export const paginatedResponse = (res, message = 'Success', data = [], page = 1, limit = 10, total = 0) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};
