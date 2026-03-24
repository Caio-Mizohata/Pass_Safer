import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.ts';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body;
            await AuthService.register({ username, email, passwordHash: password });
            res.status(201).json({ error: false, message: 'Usuário registrado com sucesso' });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const { usuario, token } = await AuthService.login(email, password);
            res.json({ error: false, message: 'Login bem-sucedido', usuario: { id: usuario.id }, token });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
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
