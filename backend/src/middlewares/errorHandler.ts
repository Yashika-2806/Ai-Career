import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const errorHandler = (error: any, req: AuthRequest, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: error.message,
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Not found',
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
  });
};
