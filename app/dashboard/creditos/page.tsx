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
import { NewCreditoDialog } from "@/components/new-credito-dialog";

const TIPO_LABEL: Record<string, string> = {
  RETENCAO: "Retenção",
  SALDO_NEGATIVO: "Saldo negativo",
  ESTIMATIVA: "Estimativa",
  PAGAMENTO_INDEVIDO: "Pagamento indevido",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function CreditosPage() {
  const empresaId = await getSelectedEmpresaId();

  if (!empresaId) {
    return (
      <p className="text-muted-foreground">
        Selecione uma empresa para ver os créditos tributários.
      </p>
    );
  }

  const creditos = await prisma.credito_tributario.findMany({
    where: { empresa_id: empresaId },
    orderBy: { created_at: "desc" },
    include: { _count: { select: { credito_utilizacao: true } } },
  });

  const totalDisponivel = creditos.reduce(
    (acc, c) => acc + Number(c.saldo_disponivel),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Créditos Tributários</h1>
          <p className="text-sm text-muted-foreground">
            Total Créditos Disponíveis: {formatCurrency(totalDisponivel)}
          </p>
        </div>
        <NewCreditoDialog empresaId={empresaId} />
      </div>

      {creditos.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum crédito tributário cadastrado.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competência</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor Original</TableHead>
              <TableHead>Saldo Disponível</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Utilizações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creditos.map((credito) => (
              <TableRow key={credito.id}>
                <TableCell>{credito.competencia_origem}</TableCell>
                <TableCell>{TIPO_LABEL[credito.tipo]}</TableCell>
                <TableCell>
                  {formatCurrency(Number(credito.valor_original))}
                </TableCell>
                <TableCell>
                  {formatCurrency(Number(credito.saldo_disponivel))}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {credito.descricao ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {credito._count.credito_utilizacao === 0
                    ? "Nenhuma utilização registrada"
                    : `${credito._count.credito_utilizacao} utilização(ões)`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
