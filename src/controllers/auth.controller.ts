import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.ts';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body;
            const user = await AuthService.register({ username, email, passwordHash: password });
            res.status(201).json({ message: 'Usuário registrado com sucesso'});
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const { usuario, token } = await AuthService.login(email, password);
            res.json({ message: 'Login bem-sucedido', usuario, token });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response) {
        // Para logout, geralmente o token é gerenciado no cliente, então aqui podemos apenas responder que o logout foi bem-sucedido.
        res.json({ message: 'Logout bem-sucedido' });
    }
}