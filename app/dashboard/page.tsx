import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import { getSelectedEmpresaId } from "@/lib/empresa-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const empresaId = await getSelectedEmpresaId();

  if (!empresaId) {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Selecione uma empresa para ver o dashboard.
        </p>
        <p className="text-xs text-muted-foreground">
          Logado como {user?.nome} ({user?.email}) — {user?.perfil}
        </p>
      </div>
    );
  }

  const supabase = createAdminClient();

  const [
    { data: creditos },
    { count: perdcompsAtivas },
    { count: apuracaoAberta },
    { count: inssAberto },
  ] = await Promise.all([
    supabase
      .from("credito_tributario")
      .select("saldo_disponivel")
      .eq("empresa_id", empresaId),
    supabase
      .from("perdcomp")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .in("status", ["ELABORACAO", "TRANSMITIDA", "EM_ANALISE"]),
    supabase
      .from("apuracao_mensal")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .eq("status", "RASCUNHO"),
    supabase
      .from("controle_inss")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .eq("status", "ABERTO"),
  ]);

  const totalCreditos = (creditos ?? []).reduce(
    (acc, c) => acc + Number(c.saldo_disponivel),
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Créditos Disponíveis</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(totalCreditos)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>PERDCOMPs Ativas</CardDescription>
            <CardTitle className="text-2xl">{perdcompsAtivas ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Apurações em Rascunho</CardDescription>
            <CardTitle className="text-2xl">{apuracaoAberta ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>INSS em Aberto</CardDescription>
            <CardTitle className="text-2xl">{inssAberto ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <CardContent className="px-0 text-xs text-muted-foreground">
        Logado como {user?.nome} ({user?.email}) — {user?.perfil}
      </CardContent>
    </div>
  );
}
