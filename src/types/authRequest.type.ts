import type { Request } from 'express';
import type { IDecodedToken } from '../interfaces/IDecodedToken.ts';

export type AuthenticatedRequest = Request & { user?: IDecodedToken };
