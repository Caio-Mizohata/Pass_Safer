import type { Response, NextFunction } from 'express';
import { PasswordService } from '../services/password.service.ts';
import type { AuthenticatedRequest } from '../types/authRequest.type.ts';
import { PasswordEntrySchema, updatePasswordSchema } from '../schemas/password.schema.ts';
import { z } from 'zod';

export class PasswordController {
    static async getAllPasswords(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user?.id) {
                res.status(401).json({ message: 'Usuário não autenticado' });
                return;
            }

            const passwords = await PasswordService.getPasswordsByUserId(req.user.id);
            res.json(passwords);
        } catch (error) {
            next(error);
        }
    }

    static async savePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const parsedData = PasswordEntrySchema.safeParse(req.body);
            if (!parsedData.success) {
                const error: z.ZodError & { status?: number } = parsedData.error;
                error.status = 400;
                return next(error);
            }
            if (!req.user?.id) {
                res.status(401).json({ message: 'Usuário não autenticado' });
                return;
            }

            const { serviceName, usernameAccount, password, notes } = parsedData.data;

            if (!serviceName || !password) {
                res.status(400).json({ message: 'Nome do serviço e senha são obrigatórios' });
                return;
            }

            const entry = await PasswordService.savePassword(req.user.id, serviceName, password, usernameAccount, notes);
            res.status(201).json(entry);
        } catch (error) {
            next(error);
        }
    }

    static async getUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user?.id) {
                res.status(401).json({ message: 'Usuário não autenticado' });
                return;
            }

            const entryId = req.params.id;

            if (!entryId || typeof entryId !== 'string' || entryId.trim() === '') {
                res.status(400).json({ message: 'ID da credencial inválido' });
                return;
            }

            try {
                const entry = await PasswordService.getDecryptedPasswordById(entryId, req.user.id);
                return res.json(entry);
            } catch (error) {
                return res.status(404).json({ message: 'Credencial não encontrada' });
            }
        } catch (error) {
            next(error);
        }
    }

    static async updatePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const parsedData = updatePasswordSchema.safeParse(req.body);
            if (!parsedData.success) {
                const error: z.ZodError & { status?: number } = parsedData.error;
                error.status = 400;
                return next(error);
            }
            if (!req.user?.id) {
                res.status(401).json({ message: 'Usuário não autenticado' });
                return;
            }

            const { id } = req.params;
            const { serviceName, usernameAccount, password, notes } = parsedData.data;

            if (!id || typeof id !== 'string') {
                res.status(400).json({ message: 'ID da credencial inválido' });
                return;
            }

            await PasswordService.updatePassword(id, req.user.id, { serviceName, usernameAccount: usernameAccount, password, notes });

            const updatedFields = [];
            if (serviceName) updatedFields.push('Serviço');
            if (usernameAccount) updatedFields.push('Usuário');
            if (password) updatedFields.push('Senha');
            if (notes) updatedFields.push('Notas');

            res.json({ message: `${updatedFields.join(', ')} atualizado(s) com sucesso`.trim() });
        } catch (error) {
            next(error);
        }
    }

    static async deletePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user?.id) {
                res.status(401).json({ message: 'Usuário não autenticado' });
                return;
            }

            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                res.status(400).json({ message: 'ID da credencial inválido' });
                return;
            }

            await PasswordService.deletePassword(id, req.user.id);
            res.json({ message: 'Senha deletada com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}
