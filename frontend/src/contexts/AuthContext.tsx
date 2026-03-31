import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi, clearAccessToken, ApiError, setAccessToken, setApiErrorHandlers } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/contexts/auth-context";
import type { LoginRequest, RegisterRequest } from "@/types/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    clearAccessToken();
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail(null);
  }, []);

  useEffect(() => {
    setApiErrorHandlers({
      onUnauthorized: () => {
        clearAuthState();
        if (location.pathname !== "/login" && location.pathname !== "/register") {
          navigate("/login", { replace: true });
        }
      },
      onRateLimited: (error) => {
        const retryHint = error.retryAfter ? ` Aguarde ${error.retryAfter}s antes de tentar novamente.` : "";
        toast({
          variant: "destructive",
          title: "Limite de requisições atingido",
          description: `${error.message}${retryHint}`,
        });
      },
      onServerError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro no servidor",
          description: error.message,
        });
      },
    });

    return () => {
      setApiErrorHandlers(null);
    };
  }, [clearAuthState, location.pathname, navigate, toast]);

  useEffect(() => {
    let active = true;

    const bootstrapSession = async () => {
      try {
        try {
          await authApi.bootstrapCsrf();
        } catch {
          // If this fails, request() will retry bootstrap before unsafe methods.
        }

        const session = await authApi.checkSession();
        if (!active) return;
        setIsAuthenticated(session.authenticated);
      } catch (error) {
        if (!active) return;
        clearAuthState();

        if (!(error instanceof ApiError) || error.status !== 401) {
          toast({
            variant: "destructive",
            title: "Falha ao validar sessão",
            description: error instanceof Error ? error.message : "Erro inesperado",
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      active = false;
    };
  }, [clearAuthState, toast]);

  useEffect(() => {
    if (!loading && isAuthenticated && (location.pathname === "/login" || location.pathname === "/register")) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  const login = useCallback(async (data: LoginRequest) => {
    await authApi.bootstrapCsrf();
    const response = await authApi.login(data);
    if (response.token) {
      setAccessToken(response.token);
    }

    const user = response.user ?? response.usuario;
    setIsAuthenticated(true);
    setUserId(user?.id ?? null);
    setUserEmail(user?.email ?? data.email);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.bootstrapCsrf();
    const response = await authApi.register(data);
    return response.message;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if logout fails on backend, clear locally
    }
    clearAuthState();
    navigate("/login", { replace: true });
  }, [clearAuthState, navigate]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        userEmail,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
