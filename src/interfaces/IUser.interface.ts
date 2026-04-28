import { Document } from 'mongoose';

export interface IUser extends Document {
    username?: string;
    email: string;
    passwordHash: string;
    verifyPassword(password: string): Promise<boolean>;
}
