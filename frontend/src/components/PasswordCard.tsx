import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Pencil, Trash2, Loader2 } from "lucide-react";
import type { PasswordSummary } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

interface PasswordCardProps {
  password: PasswordSummary;
  onReveal: (id: string) => Promise<string>;
  onEdit: (pw: PasswordSummary) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}

export default function PasswordCard({ password, onReveal, onEdit, onDelete, deleting }: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  const clearRevealState = useCallback(() => {
    setShowPassword(false);
    setRevealedPassword(null);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    clearRevealState();
  }, [clearRevealState, password.id]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copiado!` });
    } catch {
      toast({ variant: "destructive", title: "Erro ao copiar" });
    }
  };

  const handleToggleReveal = async () => {
    if (showPassword) {
      clearRevealState();
      return;
    }

    setRevealLoading(true);
    try {
      const value = await onReveal(password.id);
      setRevealedPassword(value);
      setShowPassword(true);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        clearRevealState();
      }, 60000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível revelar a senha",
        description: error instanceof Error ? error.message : "Erro inesperado",
      });
    } finally {
      setRevealLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!revealedPassword) {
      toast({
        title: "Revele a senha primeiro",
        description: "Clique no ícone de olho para visualizar a senha antes de copiar.",
      });
      return;
    }
    await copyToClipboard(revealedPassword, "Senha");
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm transition-all hover:border-emerald-500/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-sm">
                {password.serviceName.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{password.serviceName}</h3>
                {password.usernameAccount && (
                  <p className="text-xs text-muted-foreground truncate">{password.usernameAccount}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted px-2 py-1 text-sm font-mono truncate">
                {showPassword ? revealedPassword : "••••••••••••"}
              </code>
              <button
                onClick={handleToggleReveal}
                disabled={revealLoading}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {revealLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={handleCopyPassword}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            {password.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2">{password.notes}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(password)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(password.id)}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
