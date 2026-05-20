import mongoose from "mongoose";
import { ENV } from "./env.ts"; 

const Options: mongoose.ConnectOptions = {
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    w: 'majority',
};

export const connectDB = async (): Promise<void> => {
    try {
        const Mongo_URI = `mongodb://${ENV.MONGO_INITDB_ROOT_USERNAME}:${ENV.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/${ENV.MONGO_INITDB_DATABASE}?authSource=${ENV.MONGO_AUTH_SOURCE}`;
        
        await mongoose.connect(Mongo_URI, Options);
        
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB connection failed: readyState is not connected');
        }
        
        console.log("Conectado ao MongoDB com sucesso!");
        
        mongoose.connection.on("error", (err) => {
            console.error("Erro na conexão contínua com o MongoDB:", err);
        });
        
        mongoose.connection.on("disconnected", () => {
            console.warn("Desconectado do MongoDB");
        });
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
        throw error; 
    }
};
