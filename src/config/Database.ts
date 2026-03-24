import mongoose from "mongoose";
import dotenv from "dotenv";
import { ENV } from "./env.ts";
dotenv.config({quiet: true});

const Mongo_URI: string = `mongodb://${ENV.MONGO_INITDB_ROOT_USERNAME}:${ENV.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/${ENV.MONGO_INITDB_DATABASE}?authSource=${ENV.MONGO_AUTH_SOURCE}`;

const Options = {
    maxPoolSize: 10, 
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000, 
    family: 4,
}

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(Mongo_URI, Options);
        console.log("Conectado ao MongoDB com sucesso!");
        mongoose.connection.on("error", (err) => {
            console.error("Erro na conexão com o MongoDB:", err);
        });
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
        process.exit(1);
    }
}
