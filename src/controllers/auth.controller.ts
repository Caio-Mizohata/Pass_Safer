import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.ts';
import type { AuthenticatedRequest } from '../types/authRequest.type.ts';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema.ts';
import { z } from 'zod';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const parsedData = RegisterSchema.safeParse(req.body);
            if (!parsedData.success) {
                const error: z.ZodError & { status?: number } = parsedData.error;
                error.status = 400;
                return next(error);
            }
            const { username, email, password } = parsedData.data;
            await AuthService.register({ email, passwordHash: password, ...(username !== undefined ? { username } : {}) });
            res.status(201).json({ error: false, message: 'Usuário registrado com sucesso' });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const parsedData = LoginSchema.safeParse(req.body);
            if (!parsedData.success) {
                const error = parsedData.error as z.ZodError & { status?: number };
                error.status = 400;
                return next(error);
            }
            const { email, password } = parsedData.data;
            const { usuario, token } = await AuthService.login(email, password);
            res.json({ error: false, message: 'Login bem-sucedido', usuario: { id: usuario.id }, token });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !req.user) {
                res.status(401).json({ error: true, message: 'Autenticação necessária' });
                return;
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                res.status(401).json({ error: true, message: 'Token de autenticação ausente' });
                return;
            }
            await AuthService.logout(token, req.user.id);
            res.json({ error: false, message: 'Logout realizado com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}
