import { Document, Types } from 'mongoose';

export interface ITokenBlacklist extends Document {
    token: string;
    userId: Types.ObjectId;
    expiresAt: Date;
}
