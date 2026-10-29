const getEnv = (key: string, encode = false): string => {
    const value = process.env[key];
    if (!value) throw new Error(`FATAL: Variável de ambiente ausente: ${key}`);
    return encode ? encodeURIComponent(value) : value;
};

const getOptionalEnv = (key: string, fallback: string): string => {
    const value = process.env[key];
    return value ?? fallback;
};

const NODE_ENV = getEnv('NODE_ENV');

const getSecretEnv = (key: string, minLength = 32): string => {
    const value = getEnv(key);
    if (NODE_ENV === 'production' && value.length < minLength) {
        throw new Error(`FATAL: ${key} deve ter ao menos ${minLength} caracteres em producao`);
    }
    return value;
};

const getTrustProxyHops = (): number => {
    const value = Number(getOptionalEnv('TRUST_PROXY_HOPS', '0'));
    if (!Number.isInteger(value) || value < 0) {
        throw new Error('FATAL: TRUST_PROXY_HOPS deve ser um inteiro nao negativo');
    }
    return value;
};

export const ENV = {
    MONGO_HOST: getEnv("MONGO_HOST"),
    MONGO_PORT: getEnv("MONGO_PORT"),
    MONGO_INITDB_ROOT_USERNAME: getEnv('MONGO_INITDB_ROOT_USERNAME', true),
    MONGO_INITDB_ROOT_PASSWORD: getEnv('MONGO_INITDB_ROOT_PASSWORD', true),
    MONGO_INITDB_DATABASE: getEnv('MONGO_INITDB_DATABASE', true),
    MONGO_AUTH_SOURCE: getEnv('MONGO_AUTH_SOURCE', true),
    PORT: getEnv('PORT'),
    NODE_ENV,
    SALT: getSecretEnv('SALT', 16),
    JWT_SECRET: getSecretEnv('JWT_SECRET'),
    ENCRYPTION_KEY: getSecretEnv('ENCRYPTION_KEY'),
    SESSION_SECRET: getSecretEnv('SESSION_SECRET'),
    TRUST_PROXY_HOPS: getTrustProxyHops(),
    CORS_ALLOWED_ORIGINS: getEnv('CORS_ALLOWED_ORIGINS'),
    CORS_ALLOW_NO_ORIGIN: getOptionalEnv('CORS_ALLOW_NO_ORIGIN', 'true'),
};
