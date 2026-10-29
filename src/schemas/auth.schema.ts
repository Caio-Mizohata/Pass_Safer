import { z } from 'zod';

const EmailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const PasswordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|`~\-]{8,}$/;

export const RegisterSchema = z.object({
    username: z.string()
        .trim()
        .min(3, "O nome de usuário deve ter pelo menos 3 caracteres")
        .max(30, "O nome de usuário não pode ter mais de 30 caracteres")
        .optional()
        .or(z.literal('')),
    email: z.email({ error: "O email é obrigatório" })
        .trim()
        .toLowerCase()
        .min(5, "O email deve ter pelo menos 5 caracteres")
        .max(100, "O email não pode ter mais de 100 caracteres")
        .regex(EmailRegex, "Formato de email inválido"),
    password: z.string({ error: "A senha é obrigatória" })
        .min(8, "A senha deve ter pelo menos 8 caracteres")
        .max(100, "A senha não pode ter mais de 100 caracteres")
}).strict();

export const LoginSchema = z.object({
    email: z.email({ error: "O email é obrigatório" })
        .trim()
        .toLowerCase()
        .regex(EmailRegex, "Formato de email inválido"),
    password: z.string({ error: "A senha é obrigatória" })
        .min(1, "A senha é obrigatória")
        .max(100, "A senha não pode ter mais de 100 caracteres")
}).strict();
