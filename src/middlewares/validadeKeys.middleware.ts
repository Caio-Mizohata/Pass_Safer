import type { Request, Response, NextFunction } from 'express';

export const validateAllowedKeys = (allowedKeys: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const bodyKeys: string[] = Object.keys(req.body);

        const hasInvalidKeys: boolean = bodyKeys.some(key => !allowedKeys.includes(key));

        if (hasInvalidKeys) {
            res.status(403).json({ message: 'Ação não permitida: campos inválidos detectados' });
            return;
        }

        next();
    };
};
