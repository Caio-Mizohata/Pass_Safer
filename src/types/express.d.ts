import { IDecodedToken } from "../interfaces/IDecodedToken.ts";

declare global {
    namespace Express {
        interface Request {
            user?: IDecodedToken;
            csrfToken?: () => string;
        }
    }
}

export { };
