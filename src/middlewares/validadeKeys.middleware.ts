import type { Request, Response, NextFunction } from 'express';

export const PASSWORD_ALLOWED_KEYS = ['serviceName', 'password', 'usernameAccount', 'notes'] as const;
export type PasswordAllowedKey = typeof PASSWORD_ALLOWED_KEYS[number];
export type AllowedKeys = readonly PasswordAllowedKey[];

export const validateAllowedKeys = <T extends readonly string[]>(allowedKeys: T) => {
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
