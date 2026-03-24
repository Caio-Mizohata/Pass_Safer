import { Schema, model, Document, Types } from "mongoose";

export interface ITokenBlacklist extends Document {
    token: string;
    userId: Types.ObjectId;
    expiresAt: Date;
}

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
