import { PasswordEntry } from "../models/PasswordEntry.ts";
import { EncryptionService } from "./encryption.service.ts";
import { Types } from "mongoose";

export class PasswordService {
    static async getPasswordsByUserId(userId: string) {
        if (!Types.ObjectId.isValid(userId)) throw new Error('ID do usuário inválido');

        const entries = await PasswordEntry.find({ userId: new Types.ObjectId(userId) }).select('-passwordHash');

        return entries.map(entry => ({
            id: entry._id,
            serviceName: entry.serviceName,
            usernameAccount: entry.usernameAccount,
            password: '',
            notes: entry.notes,
        }));
    }

    static async savePassword(userId: string, serviceName: string, password: string, usernameAccount?: string, notes?: string) {
        if (!Types.ObjectId.isValid(userId)) throw new Error('ID do usuário inválido');

        return await PasswordEntry.create({
            userId: new Types.ObjectId(userId),
            serviceName,
            usernameAccount: usernameAccount?.trim() ? usernameAccount : null,
            passwordHash: EncryptionService.encrypt(password),
            notes: notes?.trim() ? notes : null
        });
    }

    static async getDecryptedPasswordById(entryId: string, userId: string) {
        if (!Types.ObjectId.isValid(entryId) || !Types.ObjectId.isValid(userId)) {
            throw new Error('IDs inválidos');
        }

        const entry = await PasswordEntry.findOne({ _id: new Types.ObjectId(entryId), userId: new Types.ObjectId(userId) });
        if (!entry) throw new Error('Senha não encontrada ou acesso negado');

        return {
            id: entry._id,
            serviceName: entry.serviceName,
            usernameAccount: entry.usernameAccount,
            password: EncryptionService.decrypt(entry.passwordHash),
            notes: entry.notes,
        };
    }

    static async updatePassword(entryId: string, userId: string, data: { serviceName?: string | undefined; usernameAccount?: string | undefined; password?: string | undefined; notes?: string | undefined }) {
        if (!Types.ObjectId.isValid(entryId) || !Types.ObjectId.isValid(userId)) {
            throw new Error("Parâmetros inválidos");
        }

        const entry = await PasswordEntry.findOne({ _id: new Types.ObjectId(entryId), userId: new Types.ObjectId(userId) });
        if (!entry) throw new Error("Acesso negado ou entrada não encontrada");

        if (data.serviceName !== undefined) entry.serviceName = data.serviceName;
        if (data.usernameAccount !== undefined) entry.usernameAccount = data.usernameAccount?.trim() ? data.usernameAccount : null;
        if (data.notes !== undefined) entry.notes = data.notes?.trim() ? data.notes : null;
        if (data.password !== undefined) entry.passwordHash = EncryptionService.encrypt(data.password);
        await entry.save();
    }

    static async deletePassword(entryId: string, userId: string): Promise<void> {
        if (!Types.ObjectId.isValid(entryId) || !Types.ObjectId.isValid(userId)) {
            throw new Error("Parâmetros inválidos");
        }

        const result = await PasswordEntry.deleteOne({ _id: new Types.ObjectId(entryId), userId: new Types.ObjectId(userId) });
        if (result.deletedCount === 0) throw new Error("Acesso negado ou entrada não encontrada");
    }
}
