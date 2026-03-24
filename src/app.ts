import express from "express";
import type { Application } from "express";
import Authrouter from "./routes/auth.routes.ts";
import PassRouter from "./routes/password.routes.ts";
import { authMiddleware } from "./middlewares/auth.middleware.ts";
// import { csrfMiddleware } from "./middlewares/csrf.middleware";
import { errorHandler } from "./middlewares/error.middleware.ts";

class App {
    public app: Application;
    
    constructor() {
        this.app = express();
        this.middlewares(); 
        this.routes();
        this.errorHandling(); 
    }

    middlewares(): void {
        this.app.use(express.json());
        // this.app.use(csrfMiddleware);
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
