import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            error: true,
            message: "Acesso negado ao sistema."
        });
    }

    console.error(err);
    return res.status(err.status || 500).json({
        error: true,
        message: err.message || "Erro interno do servidor"
    });
};
