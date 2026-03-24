import type { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.ts';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Erro:", err);

    const statusCode = err?.statusCode ?? 500;
    const isProd = ENV.NODE_ENV === 'production';

    
    const logPayload = {
        message: err?.message,
        ...(isProd ? {} : { stack: err?.stack }),
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
    };
    console.error('Erro:', JSON.stringify(logPayload, null, 2));

    const message = isProd
        ? (statusCode === 500 ? 'Erro interno do servidor' : err?.message ?? 'Erro')
        : (err?.message ?? 'Erro interno do servidor');

    res.status(statusCode).json({ error: true, message });
}