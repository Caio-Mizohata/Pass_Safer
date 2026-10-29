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
import { ENV } from "./config/env.ts";

class App {
    public app: Application;

    constructor() {
        this.app = express();
        if (ENV.TRUST_PROXY_HOPS > 0) this.app.set("trust proxy", ENV.TRUST_PROXY_HOPS);
        this.middlewares();
        this.routes();
        this.errorHandling();
    }

    middlewares(): void {
        this.app.use(helmet({ contentSecurityPolicy: true }));
        this.app.use(corsMiddleware);
        this.app.use(express.json({ limit: "16kb" }));
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
