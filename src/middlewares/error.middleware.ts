import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

function getZodErrorMessage(error: ZodError) {
    return error.issues.map((issue) => issue.message).join('; ');
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code === 'EBADCSRFTOKEN') {
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

    console.error(err);
    return res.status(err.status || 500).json({
        error: true,
        message: err.message || "Erro interno do servidor"
    });
};
