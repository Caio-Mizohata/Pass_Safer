import { createContext } from "react";
import type { LoginRequest, RegisterRequest } from "@/types/api";

export interface AuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
    userEmail: string | null;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<string>;
    logout: () => Promise<void>;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);