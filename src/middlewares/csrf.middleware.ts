import { doubleCsrf } from "csrf-csrf";
import cookieParser from "cookie-parser";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ENV } from "../config/env.ts";

const isProd = ENV.NODE_ENV === "production";

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => {
        if (!ENV.SESSION_SECRET) throw new Error("FATAL: SESSION_SECRET ausente");
        return ENV.SESSION_SECRET;
    },
    getSessionIdentifier: (req) => {
        const ua = req.headers['user-agent'] ?? 'unknown';
        const ip = req.ip ?? 'unknown';
        return `${ip}|${ua}`;
    },
    cookieName: isProd ? "__Host-pass_safer-csrf-token" : "pass_safer-csrf-token",
    cookieOptions: {
        httpOnly: true,
        sameSite: "strict",
        secure: isProd,
        path: "/"
    },
    getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"] as string | undefined
});

export const csrfMiddleware: RequestHandler[] = [
    cookieParser(),
    doubleCsrfProtection
];

export const issueCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = generateCsrfToken(req, res);
    res.setHeader("x-csrf-token", token);
    next();
};
