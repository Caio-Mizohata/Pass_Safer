export interface IPasswordEntry {
    id: string;
    userId: string; 
    serviceName: string; 
    usernameEnc: string; 
    passwordEnc: string; 
    iv: string; 
    tag: string;
    createdAt: Date;
    updatedAt: Date; 
}
