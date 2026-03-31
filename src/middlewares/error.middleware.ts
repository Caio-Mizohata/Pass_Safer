import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Intercepta especificamente o erro de validação do token CSRF
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            error: true,
            message: "Sessão inválida ou expirada. Por favor, recarregue a página."
        });
    }

    // Seu tratamento de erros atual para outras exceções...
    console.error(err);
    return res.status(err.status || 500).json({
        error: true,
        message: err.message || "Erro interno do servidor"
    });
};