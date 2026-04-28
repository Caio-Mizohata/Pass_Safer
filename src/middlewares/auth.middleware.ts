import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/authRequest.type.ts';
import type { IDecodedToken } from '../interfaces/IDecodedToken.ts';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.ts';
import { TokenBlacklist } from '../models/TokenBlacklist.ts';

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: true, message: 'Autenticação necessária' });
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: true, message: 'Credenciais inválidas' });
        return;
    }

    try {
        if (await TokenBlacklist.exists({ token })) {
            res.status(401).json({ error: true, message: 'Credenciais expiradas' });
            return;
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET) as IDecodedToken;

        if (typeof decoded !== 'object' || !decoded || !('id' in decoded)) {
            res.status(401).json({ error: true, message: 'Credenciais malformadas ou inválidas' });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: true, message: 'Credenciais inválidas' });
    }
};
