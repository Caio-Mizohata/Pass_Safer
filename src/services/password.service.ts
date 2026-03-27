import { PasswordEntry } from "../models/PasswordEntry.ts";
import { EncryptionService } from "./encryption.service.ts";
import { Types } from "mongoose";

export class PasswordService {
    static async savePassword(userId: string, serviceName: string, usernameAccount: string, password: string) {
        if (!Types.ObjectId.isValid(userId)) throw new Error('ID do usuário inválido');

        return await PasswordEntry.create({
            userId: new Types.ObjectId(userId),
            serviceName,
            usernameAccount: usernameAccount?.trim() ? usernameAccount : null,
            passwordHash: EncryptionService.encrypt(password)
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

    static async updatePassword(entryId: string, userId: string, data: { serviceName?: string; usernameAccount?: string; password?: string; notes?: string }) {
        if (!Types.ObjectId.isValid(entryId) || !Types.ObjectId.isValid(userId)) {
            throw new Error("Parâmetros inválidos");
        }

        const entry = await PasswordEntry.findOne({ _id: new Types.ObjectId(entryId), userId: new Types.ObjectId(userId) });
        if (!entry) throw new Error("Acesso negado ou entrada não encontrada");

        if (data.serviceName !== undefined) entry.serviceName = data.serviceName;
        if (data.usernameAccount !== undefined) entry.usernameAccount = data.usernameAccount.trim() ? data.usernameAccount : null;
        if (data.notes !== undefined) entry.notes = data.notes;
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
