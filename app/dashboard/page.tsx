import { prisma } from "@/lib/prisma";
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

  const [creditos, perdcompsAtivas, apuracaoAberta, inssAberto] =
    await Promise.all([
      prisma.credito_tributario.aggregate({
        where: { empresa_id: empresaId },
        _sum: { saldo_disponivel: true },
      }),
      prisma.perdcomp.count({
        where: {
          empresa_id: empresaId,
          status: { in: ["ELABORACAO", "TRANSMITIDA", "EM_ANALISE"] },
        },
      }),
      prisma.apuracao_mensal.count({
        where: { empresa_id: empresaId, status: "RASCUNHO" },
      }),
      prisma.controle_inss.count({
        where: { empresa_id: empresaId, status: "ABERTO" },
      }),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Créditos Disponíveis</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(Number(creditos._sum.saldo_disponivel ?? 0))}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>PERDCOMPs Ativas</CardDescription>
            <CardTitle className="text-2xl">{perdcompsAtivas}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Apurações em Rascunho</CardDescription>
            <CardTitle className="text-2xl">{apuracaoAberta}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>INSS em Aberto</CardDescription>
            <CardTitle className="text-2xl">{inssAberto}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <CardContent className="px-0 text-xs text-muted-foreground">
        Logado como {user?.nome} ({user?.email}) — {user?.perfil}
      </CardContent>
    </div>
  );
}
