import express from "express";
import type { Application } from "express";
import Authrouter from "./routes/auth.routes.ts";
import PassRouter from "./routes/password.routes.ts";
import { authMiddleware } from "./middlewares/auth.middleware.ts";
import { csrfMiddleware } from "./middlewares/csrf.middleware.ts";
import { corsMiddleware } from "./middlewares/cors.middleware.ts";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error.middleware.ts";
import { globalLimiter } from "./middlewares/rateLimit.middleware.ts";

class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.app.set("trust proxy", 1); // Habilita o reconhecimento de proxies (importante para ngrok)
        this.middlewares();
        this.routes();
        this.errorHandling();
    }

    middlewares(): void {
        this.app.use(helmet({ contentSecurityPolicy: true }));
        this.app.use(corsMiddleware);
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(globalLimiter);
        this.app.use(csrfMiddleware);
    }

    routes(): void {
        this.app.use(Authrouter);
        this.app.use(authMiddleware, PassRouter);
    }

    errorHandling(): void {
        this.app.use(errorHandler);
    }
}

export default new App().app;
