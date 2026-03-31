import crypto from "node:crypto";
import { ENV } from "../config/env.ts";

const ALGORITHM = "aes-256-gcm";
const KEY = crypto.scryptSync(ENV.ENCRYPTION_KEY, ENV.SALT, 32);

export interface EncryptedPayload {
    iv: string;
    content: string;
    tag: string;
}

export class EncryptionService {
    static encrypt(text: string): EncryptedPayload {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
        const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);

        return {
            iv: iv.toString("hex"),
            content: encrypted.toString("hex"),
            tag: cipher.getAuthTag().toString("hex"),
        };
    }

    static decrypt(payload: EncryptedPayload): string {
        try {
            const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(payload.iv, "hex"));
            decipher.setAuthTag(Buffer.from(payload.tag, "hex"));
            const decrypted = Buffer.concat([
                decipher.update(Buffer.from(payload.content, "hex")),
                decipher.final()
            ]);
            return decrypted.toString("utf8");
        } catch (error) {
            throw new Error(`Falha ao descriptografar os dados`);
        }
    }
}
