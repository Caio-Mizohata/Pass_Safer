export interface IEncryptedPayload {
    iv: string;
    content: string;
    tag: string;
}
