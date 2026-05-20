import type { Request } from 'express';
import type { IDecodedToken } from '../interfaces/IDecodedToken.interface.ts';

export type AuthenticatedRequest = Request & { user?: IDecodedToken };
