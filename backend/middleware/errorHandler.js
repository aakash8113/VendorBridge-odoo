// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Default error format
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Prisma Errors
  if (err.name === 'PrismaClientKnownRequestError') {
    // Unique constraint violation (e.g., duplicated email or GST number)
    if (err.code === 'P2002') {
      statusCode = 400;
      message = `Duplicate field value entered. A record with this value already exists.`;
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid data provided to the database.';
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Not authorized, invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized, token expired.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;