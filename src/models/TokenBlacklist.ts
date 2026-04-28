import { Schema, model } from "mongoose";
import type { ITokenBlacklist } from "../interfaces/ITokenBlackList.interface.ts";


const TokenBlacklistSchema = new Schema<ITokenBlacklist>({
    token: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true, 
        index: true 
    },
    expiresAt: { 
        type: Date, 
        required: true, 
        index: true, 
        expires: 0 
    },
}, { timestamps: true });

export const TokenBlacklist = model<ITokenBlacklist>("TokenBlacklist", TokenBlacklistSchema);
