const getEnv = (key: string, encode = false): string => {
    const value = process.env[key];
    if (!value) throw new Error(`FATAL: Variável de ambiente ausente: ${key}`);
    return encode ? encodeURIComponent(value) : value;
};

const getOptionalEnv = (key: string, fallback: string): string => {
    const value = process.env[key];
    return value ?? fallback;
};

export const ENV = {
    MONGO_INITDB_ROOT_USERNAME: getEnv('MONGO_INITDB_ROOT_USERNAME', true),
    MONGO_INITDB_ROOT_PASSWORD: getEnv('MONGO_INITDB_ROOT_PASSWORD', true),
    MONGO_INITDB_DATABASE: getEnv('MONGO_INITDB_DATABASE', true),
    MONGO_AUTH_SOURCE: getEnv('MONGO_AUTH_SOURCE', true),
    PORT: getEnv('PORT'),
    NODE_ENV: getEnv('NODE_ENV'),
    SALT: getEnv('SALT'),
    JWT_SECRET: getEnv('JWT_SECRET'),
    ENCRYPTION_KEY: getEnv('ENCRYPTION_KEY'),
    SESSION_SECRET: getEnv('SESSION_SECRET'),
    CORS_ALLOWED_ORIGINS: getEnv('CORS_ALLOWED_ORIGINS'),
    CORS_ALLOW_NO_ORIGIN: getOptionalEnv('CORS_ALLOW_NO_ORIGIN', 'true'),
};
