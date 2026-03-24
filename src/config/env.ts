import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const encodeIf = (v?: string) => (v ? encodeURIComponent(v) : undefined);

export const ENV = {
    MONGO_INITDB_ROOT_USERNAME: encodeIf(process.env.MONGO_INITDB_ROOT_USERNAME),
    MONGO_INITDB_ROOT_PASSWORD: encodeIf(process.env.MONGO_INITDB_ROOT_PASSWORD),
    MONGO_INITDB_DATABASE: encodeIf(process.env.MONGO_INITDB_DATABASE),
    MONGO_AUTH_SOURCE: encodeIf(process.env.MONGO_AUTH_SOURCE),
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    SALT: process.env.SALT,
    JWT_SECRET: process.env.JWT_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
}