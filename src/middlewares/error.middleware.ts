import type { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.ts';

interface AppError extends Error {
    statusCode?: number;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = err.statusCode || 500;
    const isProd = ENV.NODE_ENV === 'production';

    if (!isProd || statusCode === 500) {
        console.error(`[ERROR] ${req.method} ${req.path} -`, err.message);
        if (!isProd && err.stack) console.error(err.stack);
    }

    res.status(statusCode).json({ 
        error: true, 
        message: isProd && statusCode === 500 ? 'Erro interno do servidor' : err.message 
    });
};
