import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PasswordSummary, CreatePasswordRequest, UpdatePasswordRequest } from "@/types/api";

interface PasswordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: PasswordSummary | null;
  onSubmit: (data: CreatePasswordRequest | UpdatePasswordRequest, id?: string) => Promise<void>;
}

export default function PasswordFormDialog({ open, onOpenChange, editing, onSubmit }: PasswordFormDialogProps) {
  const { toast } = useToast();
  const [serviceName, setServiceName] = useState("");
  const [usernameAccount, setUsernameAccount] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editing) {
      setServiceName(editing.serviceName);
      setUsernameAccount(editing.usernameAccount ?? "");
      setPassword("");
      setNotes(editing.notes ?? "");
    } else {
      setServiceName("");
      setUsernameAccount("");
      setPassword("");
      setNotes("");
    }
    setShowPassword(false);
  }, [editing, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedServiceName = serviceName.trim();
    const trimmedUsername = usernameAccount.trim();
    const trimmedPassword = password.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedServiceName) {
      toast({
        variant: "destructive",
        title: "Serviço obrigatório",
        description: "Informe o nome do serviço para continuar.",
      });
      return;
    }

    if (!editing && !trimmedPassword) {
      toast({
        variant: "destructive",
        title: "Senha obrigatória",
        description: "Informe a senha para criar a credencial.",
      });
      return;
    }

    if (trimmedNotes.length > 500) {
      toast({
        variant: "destructive",
        title: "Notas muito longas",
        description: "O campo de notas aceita no máximo 500 caracteres.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const data: CreatePasswordRequest | UpdatePasswordRequest = {
        serviceName: trimmedServiceName,
        usernameAccount: trimmedUsername || undefined,
        notes: trimmedNotes || undefined,
        ...(trimmedPassword ? { password: trimmedPassword } : {}),
      };

      await onSubmit(data, editing?.id);
      setPassword("");
      setShowPassword(false);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar credencial" : "Nova credencial"}</DialogTitle>
          <DialogDescription>
            {editing ? "Atualize os dados da credencial." : "Adicione uma nova senha ao seu cofre."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceName">Serviço *</Label>
            <Input
              id="serviceName"
              placeholder="Gmail, Netflix, GitHub..."
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usernameAccount">Usuário / Email da conta</Label>
            <Input
              id="usernameAccount"
              placeholder="usuario@email.com"
              value={usernameAccount}
              onChange={(e) => setUsernameAccount(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="formPassword">Senha *</Label>
            <div className="relative">
              <Input
                id="formPassword"
                type={showPassword ? "text" : "password"}
                placeholder={editing ? "Deixe em branco para manter" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editing}
                className="pr-10"
                autoComplete={editing ? "off" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Anotações opcionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{notes.length}/500</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : editing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
