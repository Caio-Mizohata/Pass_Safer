import type { Request } from "express";

export interface IAuthRequest extends Request {
    user?: {
        id: string;
        username?: string;
        email: string;
    };
}
