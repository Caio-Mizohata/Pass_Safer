import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.ts';
import type { IAuthRequest } from '../interfaces/IAuthRequest.ts';

export const authMiddleware: RequestHandler = (req, res, next) => {
    const authReq = req as IAuthRequest;
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Autenticação necessária' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    
    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET as string) as { id: string; email: string };
        authReq.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token de autenticação inválido ou expirado' });
    }
}