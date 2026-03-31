import cors, { type CorsOptions } from 'cors';
import { ENV } from '../config/env.ts';

const parseAllowedOrigins = (originsList: string): string[] => {
    return Array.from(
        new Set(originsList.split(',').map((origin) => origin.trim()).filter((origin) => origin.length > 0))
    );
};

const parseBoolean = (value: string): boolean => value.trim().toLowerCase() === 'true';

export const createCorsOptions = (): CorsOptions => {
    const allowedOrigins = parseAllowedOrigins(ENV.CORS_ALLOWED_ORIGINS);
    const allowNoOrigin = parseBoolean(ENV.CORS_ALLOW_NO_ORIGIN);

    return {
        origin: (origin, callback) => {
            if (!origin) {
                if (allowNoOrigin) {
                    callback(null, true);
                    return;
                }

                callback(new Error('Requisições sem Origin não são permitidas.'));
                return;
            }

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error('Origin não permitida pelo CORS.'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
        exposedHeaders: ['x-csrf-token'],
    };
};

export const corsMiddleware = cors(createCorsOptions());
