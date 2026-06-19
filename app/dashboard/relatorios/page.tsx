import { getSelectedEmpresaId } from "@/lib/empresa-cookie";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const RELATORIOS = [
  {
    tipo: "apuracoes",
    title: "Apuração Status",
    description: "Histórico de apurações mensais, débitos e créditos.",
  },
  {
    tipo: "creditos",
    title: "Posição de Créditos",
    description: "Créditos tributários cadastrados e saldo disponível.",
  },
  {
    tipo: "perdcomps",
    title: "Histórico de PERDCOMPs",
    description: "PERDCOMPs transmitidas, status e despachos.",
  },
  {
    tipo: "inss",
    title: "Controle de INSS",
    description: "Competências de INSS, status e recolhimentos.",
  },
];

export default async function RelatoriosPage() {
  const empresaId = await getSelectedEmpresaId();

  if (!empresaId) {
    return (
      <p className="text-muted-foreground">
        Selecione uma empresa para gerar relatórios.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {RELATORIOS.map((r) => (
          <Card key={r.tipo}>
            <CardHeader>
              <CardTitle>{r.title}</CardTitle>
              <CardDescription>{r.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                render={
                  <a href={`/api/relatorios?empresaId=${empresaId}&tipo=${r.tipo}`}>
                    Exportar Excel
                  </a>
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
