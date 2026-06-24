import { validationResult } from 'express-validator';

/**
 * validate — runs express-validator's collected results and short-circuits
 * with a 400 + consistent error shape when validation fails.
 */
export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/**
 * notFound — 404 handler for unmatched routes.
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * errorHandler — centralized error handler. Returns the consistent JSON
 * shape and never leaks stack traces in production.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Duplicate key (e.g. email already in use)
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already in use`;
  }

  const payload = { success: false, message };
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};
