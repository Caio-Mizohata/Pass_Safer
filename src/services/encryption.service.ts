import crypto from "crypto";
import { ENV } from "../config/env.ts";

const ALGORITHM = "aes-256-gcm";
const KEY = crypto.scryptSync(ENV.ENCRYPTION_KEY ?? "", "hex", 32);

export interface EncryptedPayload {
    iv: string;
    content: string;
    tag: string;
}

export class EncryptionService {
    static encrypt(text: string): EncryptedPayload {
        const iv: Buffer = crypto.randomBytes(16);
        const cipher: crypto.CipherGCM = crypto.createCipheriv(ALGORITHM, KEY, iv);
        const encrypted: Buffer = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
        const tag: Buffer = cipher.getAuthTag();

        return {
            iv: iv.toString("hex"),
            content: encrypted.toString("hex"),
            tag: tag.toString("hex"),
        };
    }

    static decrypt(payload: EncryptedPayload): string {
        const iv = Buffer.from(payload.iv, "hex");
        const content = Buffer.from(payload.content, "hex");
        const tag = Buffer.from(payload.tag, "hex");

        const decipher: crypto.DecipherGCM = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
        return decrypted.toString("utf8");
    }
}