import { Coins, FileText, ClipboardList, Receipt } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import { getSelectedEmpresaId } from "@/lib/empresa-cookie";
import { Card, CardContent } from "@/components/ui/card";

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

  const stats = [
    {
      label: "Créditos Disponíveis",
      value: formatCurrency(totalCreditos),
      icon: Coins,
      accent: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "PERDCOMPs Ativas",
      value: perdcompsAtivas ?? 0,
      icon: FileText,
      accent: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Apurações em Rascunho",
      value: apuracaoAberta ?? 0,
      icon: ClipboardList,
      accent: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "INSS em Aberto",
      value: inssAberto ?? 0,
      icon: Receipt,
      accent: "text-rose-500 bg-rose-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Logado como {user?.nome} ({user?.email}) — {user?.perfil}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.accent}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
