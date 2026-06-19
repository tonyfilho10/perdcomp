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
import { NewEmpresaDialog } from "@/components/new-empresa-dialog";
import { DesativarEmpresaButton } from "@/components/desativar-empresa-button";

const REGIME_LABEL: Record<string, string> = {
  SIMPLES: "Simples Nacional",
  LUCRO_PRESUMIDO: "Lucro Presumido",
  LUCRO_REAL: "Lucro Real",
};

function formatCnpj(cnpj: string) {
  return cnpj
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default async function EmpresasPage() {
  const supabase = createAdminClient();
  const { data: empresas } = await supabase
    .from("empresa")
    .select("*")
    .order("razao_social");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Empresas</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro de clientes do escritório
          </p>
        </div>
        <NewEmpresaDialog />
      </div>

      {!empresas || empresas.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma empresa cadastrada.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão Social</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Regime</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas.map((empresa) => (
              <TableRow key={empresa.id}>
                <TableCell className="font-medium">
                  {empresa.razao_social}
                </TableCell>
                <TableCell>{formatCnpj(empresa.cnpj)}</TableCell>
                <TableCell>{REGIME_LABEL[empresa.regime_tributario]}</TableCell>
                <TableCell>{empresa.responsavel_interno}</TableCell>
                <TableCell>
                  <Badge variant={empresa.ativa ? "default" : "secondary"}>
                    {empresa.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {empresa.ativa && (
                    <DesativarEmpresaButton empresaId={empresa.id} />
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
