import { Schema, model, type Document } from "mongoose";
import argon2, { argon2id } from "argon2";
import { PasswordEntry } from "./PasswordEntry.ts";

export interface IUser extends Document {
    username?: string;
    email: string;
    passwordHash: string;
    verifyPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    username: { 
        type: String, 
        default: null 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    passwordHash: { 
        type: String, 
        required: true, 
        minlength: 8 
    },
}, { timestamps: true });

UserSchema.pre("save", async function () {
    if (!this.isModified("passwordHash")) return;
    
    this.passwordHash = await argon2.hash(this.passwordHash, {
        type: argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
    });
});

UserSchema.pre("deleteOne", { document: true, query: false }, async function () {
    await PasswordEntry.deleteMany({ userId: this._id });
});

UserSchema.methods.verifyPassword = async function (password: string): Promise<boolean> {
    return await argon2.verify(this.passwordHash, password);
};

export const User = model<IUser>("User", UserSchema);
