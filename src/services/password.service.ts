import { PasswordEntry } from "../models/PasswordEntry.ts";
import { EncryptionService } from "./encryption.service.ts";
import type { IPasswordEntry } from "../interfaces/IPasswordEntry.ts";

export class PasswordService {
    static async savePassword(userId: string, serviceName: string, username: string, password: string): Promise<IPasswordEntry> {
        const encryptedPassword = EncryptionService.encrypt(password);
        const entry = new PasswordEntry({
            userId,
            serviceName,
            username,
            passwordHash: {
                content: encryptedPassword.content,
                iv: encryptedPassword.iv,
                tag: encryptedPassword.tag
            }
        });
        const saved = await entry.save();

        return {
            id: saved._id.toString(),
            userId: saved.userId.toString(),
            serviceName: saved.serviceName,
            usernameEnc: saved.username ?? null,
            passwordEnc: saved.passwordHash.content,
            iv: saved.passwordHash.iv,
            tag: saved.passwordHash.tag,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
        } as IPasswordEntry;
    }

    static async DecryptPasswordByUserId(userId: string): Promise<IPasswordEntry[]> {
        const entries = await PasswordEntry.find({ userId });
        if (!entries || entries.length === 0) return [];
        return entries.map(entry => ({
            userId: entry.userId.toString(),
            serviceName: entry.serviceName,
            usernameEnc: entry.username ?? null,
            passwordEnc: EncryptionService.decrypt({
                content: entry.passwordHash.content,
                iv: entry.passwordHash.iv,
                tag: entry.passwordHash.tag
            }),
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
        } as IPasswordEntry));
    }


    async updatePassword(entryId: string, userId: string, serviceName?: string, username?: string, password?: string): Promise<void> {
        const entry = await PasswordEntry.findById(entryId);
        if (!entry) throw new Error('Entry não encontrado');
        if (entry.userId.toString() !== userId) throw new Error("Acesso negado: usuário não é o proprietário da senha");

        const updateData: any = {};
        if (serviceName !== undefined) updateData.serviceName = serviceName;
        if (username !== undefined) updateData.username = username;
        if (password !== undefined) {
            const encryptedPassword = EncryptionService.encrypt(password);
            updateData.passwordHash = {
                content: encryptedPassword.content,
                iv: encryptedPassword.iv,
                tag: encryptedPassword.tag
            };
        }

        if (Object.keys(updateData).length > 0) {
            updateData.updatedAt = new Date();
            await PasswordEntry.findByIdAndUpdate(entryId, { $set: updateData });
        }
    }

    async deletePassword(entryId: string, userId: string): Promise<void> {
        await PasswordEntry.deleteOne({ _id: entryId, userId: userId });
    }
}
