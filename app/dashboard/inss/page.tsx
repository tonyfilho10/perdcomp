import { prisma } from "@/lib/prisma";
import { getSelectedEmpresaId } from "@/lib/empresa-cookie";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  ABERTO: "Aberto",
  RECOLHIDO: "Recolhido",
  RETIFICADO: "Retificado",
};

export default async function InssPage() {
  const empresaId = await getSelectedEmpresaId();

  if (!empresaId) {
    return (
      <p className="text-muted-foreground">
        Selecione uma empresa para ver o controle de INSS.
      </p>
    );
  }

  const registros = await prisma.controle_inss.findMany({
    where: { empresa_id: empresaId },
    orderBy: { competencia: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Controle de INSS</h1>

      {registros.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum registro de INSS para esta empresa.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competência</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de recolhimento</TableHead>
              <TableHead>Observação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.competencia}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {STATUS_LABEL[r.status ?? "ABERTO"]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {r.data_recolhimento
                    ? new Date(r.data_recolhimento).toLocaleDateString("pt-BR")
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.observacao ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
