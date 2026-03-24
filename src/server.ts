import "dotenv/config"; 
import mongoose from "mongoose";
import { ENV } from "./config/env.ts";
import { connectDB } from "./config/Database.ts";
import app from "./app.ts";

const startServer = async (): Promise<void> => {
   try {
        await connectDB();
        
        const server = app.listen(ENV.PORT, () => {
            console.log(`Aplicação rodando em http://localhost:${ENV.PORT}`);
        });

        const gracefulShutdown = async (): Promise<void> => {
            console.log("Encerrando o servidor e banco de dados...");
            await mongoose.disconnect();
            server.close(() => process.exit(0));
        };
        
        process.on("SIGINT", gracefulShutdown);
        process.on("SIGTERM", gracefulShutdown);
   } catch (error) {
        console.error("Erro fatal ao iniciar:", error);
        process.exit(1);
   }
};

startServer();
