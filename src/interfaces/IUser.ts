export interface IUser {
    id: string;
    username?: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}
