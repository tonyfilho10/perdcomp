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
import { NewPerdcompDialog } from "@/components/new-perdcomp-dialog";
import { NewApuracaoDialog } from "@/components/new-apuracao-dialog";
import { PerdcompActions } from "@/components/perdcomp-actions";

const STATUS_LABEL: Record<string, string> = {
  ELABORACAO: "Elaboração",
  TRANSMITIDA: "Transmitida",
  EM_ANALISE: "Em análise",
  HOMOLOGADA: "Homologada",
  INDEFERIDA: "Indeferida",
  NECESSITA_REVISAO: "Necessita revisão",
  CANCELADA: "Cancelada",
};

const TRIBUTO_LABEL: Record<string, string> = {
  PIS: "PIS",
  COFINS: "COFINS",
  PIS_COFINS: "PIS/COFINS",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function PerdcompsPage() {
  const empresaId = await getSelectedEmpresaId();

  if (!empresaId) {
    return (
      <p className="text-muted-foreground">
        Selecione uma empresa para ver as PERDCOMPs.
      </p>
    );
  }

  const supabase = createAdminClient();

  const [{ data: perdcomps }, { data: apuracoesRaw }, { data: creditosRaw }] =
    await Promise.all([
      supabase
        .from("perdcomp")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false }),
      supabase
        .from("apuracao_mensal")
        .select("id, competencia")
        .eq("empresa_id", empresaId)
        .order("competencia", { ascending: false }),
      supabase
        .from("credito_tributario")
        .select("id, competencia_origem, saldo_disponivel")
        .eq("empresa_id", empresaId)
        .gt("saldo_disponivel", 0)
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">PERDCOMPs Ativas</h1>
        <div className="flex gap-2">
          <NewApuracaoDialog empresaId={empresaId} />
          <NewPerdcompDialog
            empresaId={empresaId}
            apuracoes={apuracoesRaw ?? []}
            creditos={(creditosRaw ?? []).map((c) => ({
              id: c.id,
              competencia_origem: c.competencia_origem,
              saldo_disponivel: Number(c.saldo_disponivel),
            }))}
          />
        </div>
      </div>

      {!perdcomps || perdcomps.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma PERDCOMP cadastrada.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competência</TableHead>
              <TableHead>Tributo</TableHead>
              <TableHead>Débito</TableHead>
              <TableHead>Crédito utilizado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {perdcomps.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.competencia}</TableCell>
                <TableCell>{TRIBUTO_LABEL[p.tributo]}</TableCell>
                <TableCell>{formatCurrency(Number(p.debito))}</TableCell>
                <TableCell>
                  {formatCurrency(Number(p.credito_utilizado))}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {STATUS_LABEL[p.status ?? "ELABORACAO"]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <PerdcompActions
                    perdcompId={p.id}
                    status={p.status ?? "ELABORACAO"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
