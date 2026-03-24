import dotenv from "dotenv";
import { ENV } from "./config/env.ts";
import { connectDB } from "./config/Database.ts";
import app from "./app.ts";
dotenv.config();

const startServer = async (): Promise<void> => {
   try {
        await connectDB();
        const server = app.listen(ENV.PORT, () => {
            console.log(`Aplicação disponível em http://localhost:${ENV.PORT}`);
        });

        const gracefull = async (): Promise<void> => {
            console.log(`Encerrando o servidor...`);
            server.close(() => process.exit(0));
        };
        
        process.on("SIGINT", gracefull);
        process.on("SIGTERM", gracefull);
   } catch (error) {
        console.error("Erro ao iniciar o servidor:", error);
        process.exit(1);
   }
};

startServer();
