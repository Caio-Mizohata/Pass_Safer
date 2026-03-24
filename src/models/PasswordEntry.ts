import { Schema, model, Document, Types } from "mongoose";

export interface IPasswordEntry extends Document {
    userId: Types.ObjectId; 
    serviceName: string; 
    username?: string; 
    passwordHash: {
        iv: string;
        tag: string;
        content: string;
    };
    createdAt: Date;
    updatedAt: Date; 
}

const PasswordEntrySchema: Schema<IPasswordEntry> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    serviceName: {
        type: String,
        required: true,
        trim: true,
        describe: "Name of the service (e.g., 'Gmail', 'Facebook')"
    },
    username: {
        type: String,
        required: false,
        trim: true,
    },
    passwordHash: {
        iv: {
            type: String,
            required: true,
        },
        tag: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export const PasswordEntry = model<IPasswordEntry>("PasswordEntry", PasswordEntrySchema);
