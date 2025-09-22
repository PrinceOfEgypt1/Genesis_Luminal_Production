/**
 * @fileoverview Validation middleware
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Validate request body with Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: validationErrors,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({
        error: 'Internal validation error',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input
        }));

        return res.status(400).json({
          error: 'Query validation failed',
          details: validationErrors,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({
        error: 'Internal validation error',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Global validation error handler
 */
export const validationErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.errors,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  next(error);
};

export default {
  validateBody,
  validateQuery,
  validationErrorHandler
};
