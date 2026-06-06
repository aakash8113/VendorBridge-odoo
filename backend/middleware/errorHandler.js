import config from '../config/index.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    ...(config.app.nodeEnv === 'development' && { stack: err.stack }),
  });
};
