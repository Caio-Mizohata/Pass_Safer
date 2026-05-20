export interface IDecodedToken {
    id: string;
    email: string;
    username?: string;
    iat: number;  
    exp: number;  
}
