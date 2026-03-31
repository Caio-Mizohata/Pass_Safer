import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

// Função para determinar se a requisição é genuinamente local (sem proxy) ou se está vindo de um proxy (como ngrok)
const isGenuinelyLocal = (req: Request) => {
    const isLocalIp = req.ip === '127.0.0.1' || req.ip === '::1';
    const isProxied = req.headers['x-forwarded-for'] !== undefined;
    
    return isLocalIp && !isProxied;
};

// Rate limit global: 50 requisições por 15 minutos
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, 
    message: 'Muitas requisições realizadas, tente novamente mais tarde.',
    standardHeaders: true, 
    legacyHeaders: false,
    skip: isGenuinelyLocal,
});

// Rate limit específico para endpoints de autenticação: 5 tentativas por 15 minutos
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,
    message: 'Muitas tentativas de login/registro. Tente novamente em 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: isGenuinelyLocal,
});

// Rate limit para operações de senha: 30 requisições por 15 minutos
export const passwordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, 
    message: 'Muitas requisições de senha. Tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: isGenuinelyLocal,
});
