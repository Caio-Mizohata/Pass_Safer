import cors, { type CorsOptions } from 'cors';
import { ENV } from '../config/env.ts';

// Mapeia as origens permitidas definidas em .env
const allowedOrigins = [
    ...new Set(ENV.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)),
];

const allowNoOrigin = ENV.CORS_ALLOW_NO_ORIGIN.trim().toLowerCase() === 'true';

const corsError = () => Object.assign(new Error('Origin não permitida pelo CORS.'), { status: 403 });

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowed = (!origin && allowNoOrigin) || (origin !== undefined && allowedOrigins.includes(origin));
    callback(allowed ? null : corsError(), allowed);
  },

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  exposedHeaders: ['x-csrf-token'],
};

export const corsMiddleware = cors(corsOptions);
