import { Document, Types } from 'mongoose';

export interface IPasswordEntry extends Document {
    userId: Types.ObjectId; 
    serviceName: string; 
    usernameAccount?: string | null; 
    passwordHash: { 
        iv: string; 
        tag: string; 
        content: string; 
    };
    notes?: string | null;
}
