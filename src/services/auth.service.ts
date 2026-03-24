import argon2 from "argon2";
import { ENV } from "../config/env.ts";
import jwt from "jsonwebtoken";
import { User } from "../models/User.ts";
import type { IUser } from "../interfaces/IUser.ts";

export class AuthService {
    static async register(userData: Partial<IUser>) {
        if (typeof userData.email !== "string" || typeof userData.passwordHash !== "string") {
            throw new Error("Email e senha são obrigatórios e devem ser strings");
        }
        const usuarioExistente = await User.findOne({ email: userData.email });
        if (usuarioExistente) throw new Error("Usuario já cadastrado");

        const usuario = await new User({
            username: userData.username,
            email: userData.email,
            passwordHash: userData.passwordHash,
        }).save();
        return usuario;
    }

    static async login(email: string, password: string) {
        const usuario = await User.findOne({ email });
        if (!usuario) throw new Error("Cadastro não encontrado");

        let senhaValida: boolean = false;
        if (usuario.passwordHash) {
            senhaValida = await argon2.verify(usuario.passwordHash, password);
        }

        if (!senhaValida) throw new Error("Senha incorreta");

        const token = jwt.sign({
            id: usuario._id.toString(),
            email: usuario.email,
            username: usuario.username,
        }, ENV.JWT_SECRET as string, { expiresIn: "1h" });

        return { usuario, token };
    }

    static async logout() {
        return { message: 'Logout bem-sucedido' };
    }
}

export default new AuthService();
