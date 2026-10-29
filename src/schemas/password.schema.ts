import { z } from 'zod';

export const PasswordEntrySchema = z.object({
    serviceName: z.string({ error: "O nome do serviço é obrigatório" })
        .trim()
        .min(1, { error: "O nome do serviço é obrigatório" })
        .max(50, { error: "O nome do serviço não pode ter mais de 50 caracteres" }),
    usernameAccount: z.string()
        .max(100, { error: "O nome de usuário não pode ter mais de 100 caracteres" })
        .optional()
        .or(z.literal('')),
    password: z.string({ error: "A senha é obrigatória" })
        .min(1, { error: "A senha é obrigatória" })
        .max(100, { error: "A senha não pode ter mais de 100 caracteres" }),
    notes: z.string()
        .max(500, { error: "As notas não podem ter mais de 500 caracteres" })
        .optional()
        .or(z.literal(''))
}).strict() // Rejeita campos desconhecidos 

export const updatePasswordSchema = PasswordEntrySchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "Ao menos um campo deve ser informado" }
);
