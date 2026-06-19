import { prisma } from "@/lib/prisma";
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

export default async function UsuariosPage() {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <NewUsuarioDialog />
      </div>

      {usuarios.length === 0 ? (
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
                <TableCell className="font-medium">{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Badge variant={usuario.perfil === "ADMIN" ? "default" : "outline"}>
                    {usuario.perfil}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.ativo ? "default" : "secondary"}>
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
