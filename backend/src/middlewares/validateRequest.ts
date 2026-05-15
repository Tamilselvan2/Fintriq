import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: (error as ZodError<any>).errors,
        });
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      Object.assign(req.query, await schema.parseAsync(req.query));

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors: (error as ZodError<any>).errors,
        });
      } else {
        next(error);
      }
    }
  };
};

export const validateParams = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      Object.assign(req.params, await schema.parseAsync(req.params));

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Params validation failed',
          errors: (error as ZodError<any>).errors,
        });
      } else {
        next(error);
      }
    }
  };
};