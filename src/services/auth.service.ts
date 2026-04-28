import { ENV } from "../config/env.ts";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { User } from "../models/User.ts";
import { TokenBlacklist } from "../models/TokenBlacklist.ts";
import type { IDecodedToken } from "../interfaces/IDecodedToken.ts";

export class AuthService {
    static async register(userData: { email: string; passwordHash: string; username?: string}) {
        if (await User.exists({ email: userData.email })) {
            throw new Error("Este email já foi cadastrado");
        }
        return await User.create(userData);
    }

    static async login(email: string, password: string) {
        const usuario = await User.findOne({ email });
        if (!usuario) throw new Error("Cadastro não encontrado");

        if (!(await usuario.verifyPassword(password))) {
            throw new Error("Senha incorreta");
        }

        const token = jwt.sign(
            { id: usuario._id.toString(), email: usuario.email, username: usuario.username },
            ENV.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return { usuario, token };
    }

    static async logout(token: string, userId: string) {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as IDecodedToken;
        if (!decoded.exp) throw new Error("Autorização inválida");

        await TokenBlacklist.create({
            token,
            userId: new Types.ObjectId(userId),
            expiresAt: new Date(decoded.exp * 1000),
        });

        return { message: "Logout realizado com sucesso" };
    }

    static async isTokenBlacklisted(token: string): Promise<boolean> {
        return !!(await TokenBlacklist.exists({ token }));
    }
}
