import { Request, Response, NextFunction } from "express";
export function validateSchema(schema: any) { return (req: Request, res: Response, next: NextFunction) => next(); }
export function validateResponse(schema: any) { return (req: Request, res: Response, next: NextFunction) => next(); }
export function sanitizeInput(req: Request, res: Response, next: NextFunction) { next(); }
