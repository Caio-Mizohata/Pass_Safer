import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { ApiError, passwordsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Plus, LogOut, Search, KeyRound, Loader2 } from "lucide-react";
import PasswordCard from "@/components/PasswordCard";
import PasswordFormDialog from "@/components/PasswordFormDialog";
import { useToast } from "@/hooks/use-toast";
import type { PasswordSummary, CreatePasswordRequest, UpdatePasswordRequest } from "@/types/api";

export default function Dashboard() {
  const { logout, userEmail } = useAuth();
  const { toast } = useToast();

  const [passwords, setPasswords] = useState<PasswordSummary[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PasswordSummary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loadingPasswords, setLoadingPasswords] = useState(true);

  const loadPasswords = useCallback(
    async ({ showLoader = true }: { showLoader?: boolean } = {}) => {
      if (showLoader) {
        setLoadingPasswords(true);
      }

      try {
        const list = await passwordsApi.list();
        setPasswords(list);
      } catch (error) {
        if (error instanceof ApiError && error.status === 429) {
          return;
        }
        toast({
          variant: "destructive",
          title: "Erro ao carregar credenciais",
          description: error instanceof Error ? error.message : "Erro inesperado",
        });
      } finally {
        if (showLoader) {
          setLoadingPasswords(false);
        }
      }
    },
    [toast]
  );

  useEffect(() => {
    void loadPasswords();
  }, [loadPasswords]);

  const filteredPasswords = passwords.filter(
    (pw) =>
      pw.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      pw.usernameAccount?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (pw: PasswordSummary) => {
    setEditing(pw);
    setDialogOpen(true);
  };

  const handleSubmit = useCallback(
    async (data: CreatePasswordRequest | UpdatePasswordRequest, id?: string) => {
      try {
        if (id) {
          await passwordsApi.update(id, data as UpdatePasswordRequest);
          await loadPasswords({ showLoader: false });
          toast({ title: "Credencial atualizada!" });
        } else {
          await passwordsApi.create(data as CreatePasswordRequest);
          await loadPasswords({ showLoader: false });
          toast({ title: "Credencial criada!" });
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 429) {
          throw error;
        }
        toast({
          variant: "destructive",
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro inesperado",
        });
        throw error;
      }
    },
    [loadPasswords, toast]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await passwordsApi.delete(id);
        setPasswords((prev) => prev.filter((pw) => pw.id !== id));
        toast({ title: "Credencial removida!" });
      } catch (error) {
        if (error instanceof ApiError && error.status === 429) {
          return;
        }
        toast({
          variant: "destructive",
          title: "Erro ao deletar",
          description: error instanceof Error ? error.message : "Erro inesperado",
        });
      } finally {
        setDeletingId(null);
      }
    },
    [toast]
  );

  const handleRevealPassword = useCallback(async (id: string) => {
    const detail = await passwordsApi.getById(id);
    return detail.password;
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-500" />
            <span className="text-lg font-bold text-foreground">
              Pass<span className="text-emerald-500">Safer</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden text-sm text-muted-foreground sm:inline">{userEmail}</span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut}>
              <LogOut className="mr-1.5 h-4 w-4" />
              {loggingOut ? "Saindo..." : "Sair"}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Seu Cofre</h1>
            <p className="text-sm text-muted-foreground">
              {passwords.length} {passwords.length === 1 ? "credencial" : "credenciais"} armazenada{passwords.length === 1 ? "" : "s"}
            </p>
          </div>
          <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova credencial
          </Button>
        </div>

        {passwords.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por serviço ou usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {loadingPasswords ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando credenciais...</p>
          </div>
        ) : passwords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <KeyRound className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Nenhuma credencial</h2>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Comece adicionando sua primeira credencial ao cofre. Suas senhas serão criptografadas e armazenadas com segurança.
            </p>
            <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="mr-1.5 h-4 w-4" />
              Adicionar credencial
            </Button>
          </div>
        ) : filteredPasswords.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum resultado para "{search}"</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredPasswords.map((pw) => (
              <PasswordCard
                key={pw.id}
                password={pw}
                onReveal={handleRevealPassword}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleting={deletingId === pw.id}
              />
            ))}
          </div>
        )}
      </main>

      <PasswordFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
