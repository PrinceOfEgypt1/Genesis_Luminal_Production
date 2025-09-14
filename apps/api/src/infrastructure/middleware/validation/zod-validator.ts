import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validateSchema(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error
      });
    }
  };
}

export function validateResponse(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}

export function sanitizeInput() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      delete req.body.__proto__;
      delete req.body.constructor;
    }
    next();
  };
}
