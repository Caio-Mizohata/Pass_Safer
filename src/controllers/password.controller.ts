import type { Request, Response, NextFunction } from 'express';
import { PasswordService } from '../services/password.service.ts';

export class PasswordController {
    static async savePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { serviceName, username, password } = req.body;
            const entry = await PasswordService.savePassword(req.user!.id, serviceName, username, password);
            res.status(201).json(entry);
        } catch (error) {
            next(error);
        }
    }

    static async getPasswords(req: Request, res: Response, next: NextFunction) {
        try {
            const entries = await PasswordService.DecryptPasswordByUserId(req.user!.id);
            if (!req.user!.id) return res .status(400).json({ message: 'ID do usuário não encontrado' });
            res.json(entries);
        } catch (error) {
            next(error);
        } 
    }

    static async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { serviceName, username, password } = req.body;
            if (!id || typeof id !== 'string') {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            await new PasswordService().updatePassword(id, req.user!.id, serviceName, username, password);
            res.json({ message: `${serviceName ? `Serviço ${serviceName} ` : ''}${username ? `Usuário ${username} ` : ''}${password ? `Senha ` : ''} atualizada com sucesso` });
        } catch (error) {
            next(error);
        }
    }

    static async deletePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            await new PasswordService().deletePassword(id, req.user!.id);
            res.json({ message: 'Senha deletada com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}