
export const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'An unexpected internal server error occurred';

  if (error instanceof SyntaxError && statusCode === 400 && 'body' in error) {
    message = 'Invalid JSON payload. Please check your request body syntax.';
  }

  const responseStatus = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

  if (statusCode === 500) {
    console.error('UNHANDLED SERVER ERROR:', error);
  }

  res.status(statusCode).json({
    status: responseStatus,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};