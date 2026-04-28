import { Schema, model } from "mongoose";
import type { IPasswordEntry } from "../interfaces/IPasswordEntry.interface.ts";


const PasswordEntrySchema = new Schema<IPasswordEntry>({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    serviceName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    usernameAccount: { 
        type: String, 
        trim: true, 
        default: null
    },
    passwordHash: {
        iv: { 
            type: String, 
            required: true 
        },
        tag: { 
            type: String, 
            required: true 
        },
        content: { 
            type: String, 
            required: true 
        },
    },
    notes: { 
        type: String, 
        default: null, 
        trim: true, 
        maxLength: 500 
    }
}, { timestamps: true });

export const PasswordEntry = model<IPasswordEntry>("PasswordEntry", PasswordEntrySchema);
