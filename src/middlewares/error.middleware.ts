import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

function getZodErrorMessage(error: ZodError) {
    return error.issues.map((issue) => issue.message).join('; ');
}

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            error: true,
            message: "Acesso negado ao sistema."
        });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: true,
            message: getZodErrorMessage(err),
        });
    }

    const status = typeof err === 'object' && err !== null && 'status' in err &&
        typeof err.status === 'number' && err.status >= 400 && err.status < 500 ? err.status : 500;
        const message = status < 500 && err instanceof Error ? err.message : "Erro interno do servidor";

    console.error(err);
    return res.status(status).json({
        error: true,
        message
    });
};
