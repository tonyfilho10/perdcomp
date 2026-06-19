import { createAdminClient } from "@/lib/supabase/admin";
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
import { NewApuracaoDialog } from "@/components/new-apuracao-dialog";
import { FecharApuracaoButton } from "@/components/fechar-apuracao-button";

const STATUS_LABEL: Record<string, string> = {
  RASCUNHO: "Rascunho",
  FECHADA: "Fechada",
  RETIFICADA: "Retificada",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function ApuracoesPage() {
  const empresaId = await getSelectedEmpresaId();

  if (!empresaId) {
    return (
      <p className="text-muted-foreground">
        Selecione uma empresa no topo para ver as apurações.
      </p>
    );
  }

  const supabase = createAdminClient();
  const { data: apuracoes } = await supabase
    .from("apuracao_mensal")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("competencia", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Apurações Mensais</h1>
        <NewApuracaoDialog empresaId={empresaId} />
      </div>

      {!apuracoes || apuracoes.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma apuração cadastrada.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competência</TableHead>
              <TableHead>Débito Apurado</TableHead>
              <TableHead>Crédito Retenção</TableHead>
              <TableHead>Créditos Anteriores</TableHead>
              <TableHead>Valor Compensado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apuracoes.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.competencia}</TableCell>
                <TableCell>{formatCurrency(Number(a.debito_apurado ?? 0))}</TableCell>
                <TableCell>{formatCurrency(Number(a.credito_retencao ?? 0))}</TableCell>
                <TableCell>{formatCurrency(Number(a.creditos_anteriores ?? 0))}</TableCell>
                <TableCell>{formatCurrency(Number(a.valor_compensado ?? 0))}</TableCell>
                <TableCell>
                  <Badge variant={a.status === "FECHADA" ? "default" : "outline"}>
                    {STATUS_LABEL[a.status ?? "RASCUNHO"]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {a.status !== "FECHADA" && (
                    <FecharApuracaoButton apuracaoId={a.id} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
