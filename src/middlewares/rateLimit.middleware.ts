import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

// Rate limit global: 50 requisições por 15 minutos
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, 
    message: 'Muitas requisições realizadas, tente novamente mais tarde.',
    standardHeaders: true, // Retorna informações do rate limit em `RateLimit-*` headers
    legacyHeaders: false, // Desabilita `X-RateLimit-*` headers
    keyGenerator: (req: Request) => {
        return ipKeyGenerator(req.ip || '');
    },
    skip: (req: Request) => {
        // Não aplica rate limit a requisições do localhost em desenvolvimento
        return req.ip === '127.0.0.1' || req.ip === '::1';
    },
});

// Rate limit específico para endpoints de autenticação: 5 tentativas por 15 minutos
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,
    message: 'Muitas tentativas de login/registro. Tente novamente em 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        return ipKeyGenerator(req.ip || '');
    },
    skip: (req: Request) => {
        return req.ip === '127.0.0.1' || req.ip === '::1';
    },
});

// Rate limit para operações de senha: 30 requisições por 15 minutos
export const passwordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, 
    message: 'Muitas requisições de senha. Tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        return ipKeyGenerator(req.ip || '');
    },
    skip: (req: Request) => {
        return req.ip === '127.0.0.1' || req.ip === '::1';
    },
});
