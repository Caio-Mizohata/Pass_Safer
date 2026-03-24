import express from "express";
import type { Application } from "express";
import Authrouter from "./routes/auth.routes.ts";
import PassRouter from "./routes/password.routes.ts";
import { authMiddleware } from "./middlewares/auth.middleware.ts";
import { errorHandler } from "./middlewares/error.middleware.ts";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

class App {
    public app: Application;
    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.middlewares();
        this.routes();
    }

    routes(): void {
        this.app.use(Authrouter);
        this.app.use(authMiddleware);
        this.app.use(PassRouter);
    }

    middlewares(): void {
        this.app.use(errorHandler);
    }
}

export default new App().app;
