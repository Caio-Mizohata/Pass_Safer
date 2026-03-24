import { PasswordEntry } from "../models/PasswordEntry.ts";
import { EncryptionService } from "./encryption.service.ts";
import { Types } from "mongoose";

export class PasswordService {
    static async savePassword(userId: string, serviceName: string, usernameAccount: string, password: string) {
        return await PasswordEntry.create({
            userId: new Types.ObjectId(userId),
            serviceName,
            usernameAccount: usernameAccount || null,
            passwordHash: EncryptionService.encrypt(password)
        });
    }

    static async getDecryptedPasswords(userId: string) {
        const entries = await PasswordEntry.find({ userId: new Types.ObjectId(userId) });
        
        return entries.map(entry => ({
            id: entry._id,
            // serviceName: entry.serviceName,
            // usernameAccount: entry.usernameAccount,
            password: EncryptionService.decrypt(entry.passwordHash),
            // notes: entry.notes,
        }));
    }

    static async updatePassword(entryId: string, userId: string, data: { serviceName?: string; usernameAccount?: string; password?: string; notes?: string }) {
        const entry = await PasswordEntry.findOne({ _id: entryId, userId: new Types.ObjectId(userId) });
        if (!entry) throw new Error("Acesso negado ou entrada não encontrada");

        if (data.serviceName) entry.serviceName = data.serviceName;
        if (data.usernameAccount !== undefined) entry.usernameAccount = data.usernameAccount;
        if (data.notes !== undefined) entry.notes = data.notes;
        if (data.password) entry.passwordHash = EncryptionService.encrypt(data.password);

        await entry.save();
    }

    static async deletePassword(entryId: string, userId: string): Promise<void> {
        await PasswordEntry.deleteOne({ _id: entryId, userId: new Types.ObjectId(userId) });
    }
}
