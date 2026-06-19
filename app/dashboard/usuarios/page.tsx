import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NewUsuarioDialog } from "@/components/new-usuario-dialog";

const AVATAR_COLORS = [
  "bg-sky-500/15 text-sky-400",
  "bg-violet-500/15 text-violet-400",
  "bg-emerald-500/15 text-emerald-400",
  "bg-amber-500/15 text-amber-400",
  "bg-rose-500/15 text-rose-400",
  "bg-cyan-500/15 text-cyan-400",
];

function avatarColor(seed: string) {
  const index = seed.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default async function UsuariosPage() {
  const supabase = createAdminClient();
  const { data: usuarios } = await supabase
    .from("usuario")
    .select("*")
    .order("nome");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <NewUsuarioDialog />
      </div>

      {!usuarios || usuarios.length === 0 ? (
        <p className="text-muted-foreground">Nenhum usuário cadastrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(usuario.nome)}`}
                    >
                      {usuario.nome.slice(0, 1).toUpperCase()}
                    </div>
                    {usuario.nome}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{usuario.email}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      usuario.perfil === "ADMIN"
                        ? "bg-fuchsia-500/15 text-fuchsia-400"
                        : "bg-blue-500/15 text-blue-400"
                    }
                  >
                    {usuario.perfil}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      usuario.ativo
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-zinc-500/15 text-zinc-400"
                    }
                  >
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
