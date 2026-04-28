import { z } from 'zod';

export const PasswordEntrySchema = z.object({
    serviceName: z.string({ error: "O nome do serviço é obrigatório" })
        .min(1, { error: "O nome do serviço é obrigatório" })
        .max(50, { error: "O nome do serviço não pode ter mais de 50 caracteres" }),
    usernameAccount: z.string()
        .optional()
        .or(z.literal('')),
    password: z.string({ error: "A senha é obrigatória" })
        .min(1, { error: "A senha é obrigatória" })
        .max(100, { error: "A senha não pode ter mais de 100 caracteres" }),
    notes: z.string()
        .optional()
        .or(z.literal(''))
})

export const updatePasswordSchema = PasswordEntrySchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: "Ao menos um campo deve ser informado" }
);
