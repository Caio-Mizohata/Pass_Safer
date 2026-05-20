import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (password !== confirmPassword) {
    //   toast({
    //     variant: "destructive",
    //     title: "Erro",
    //     description: "As senhas não coincidem.",
    //   });
    //   return;
    // }

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 8 caracteres.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const message = await register({
        username: username || undefined,
        email,
        password,
      });
      toast({
        title: "Conta criada!",
        description: message,
      });
      navigate("/login");
    } catch (error) {
      let description = "Erro inesperado";

      if (error instanceof ApiError) {
        if (error.status === 429) {
          return;
        }
        if (error.status === 400) {
          description = error.message;
        } else if (error.status === 409) {
          description = "Este e-mail já está em uso.";
        } else {
          description = error.message;
        }
      } else if (error instanceof Error) {
        description = error.message;
      }

      toast({
        variant: "destructive",
        title: "Erro ao registrar",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Pass<span className="text-emerald-500">Safer</span>
          </h1>
        </div>

        <div className="rounded-lg p-6 bg-background/50 shadow-xl shadow-primary/30">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Criar conta</CardTitle>
              <CardDescription>Registre-se para começar a proteger suas senhas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de usuário (opcional)</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Seu nome"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <PasswordInput
                  id="password"
                  label="Senha"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
