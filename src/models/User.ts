import { Schema, model, type Document } from "mongoose";
import argon2, { argon2id } from "argon2";
import { PasswordEntry } from "./PasswordEntry.ts";

export interface IUser extends Document {
    username?: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        required: false,
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
        minlength: 8,
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

UserSchema.pre("save", async function () {
    if (!this.isModified("passwordHash")) return;
    const hash = await argon2.hash(this.passwordHash, {
        type: argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
    });
    this.passwordHash = hash;
});

// Cascade delete: when a user document is deleted, remove their PasswordEntry documents.
UserSchema.pre("deleteOne", { document: true, query: false }, async function () {
    await PasswordEntry.deleteMany({ userId: this._id });
});

UserSchema.methods.verifyPassword = async function (password: string): Promise<boolean> {
    return await argon2.verify(this.passwordHash, password);
};

export const User = model<IUser>("User", UserSchema);

