import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

const TIPOS = ["apuracoes", "creditos", "perdcomps", "inss"] as const;
type Tipo = (typeof TIPOS)[number];

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const empresaId = searchParams.get("empresaId");
  const tipo = searchParams.get("tipo") as Tipo | null;

  if (!empresaId || !tipo || !TIPOS.includes(tipo)) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(tipo);

  if (tipo === "apuracoes") {
    sheet.columns = [
      { header: "Competência", key: "competencia", width: 14 },
      { header: "Status", key: "status", width: 14 },
      { header: "Débito Apurado", key: "debito_apurado", width: 16 },
      { header: "Crédito Retenção", key: "credito_retencao", width: 16 },
      { header: "Créditos Anteriores", key: "creditos_anteriores", width: 18 },
      { header: "Valor Compensado", key: "valor_compensado", width: 16 },
      { header: "INSS Devido", key: "inss_devido", width: 14 },
      { header: "INSS Retido", key: "inss_retido", width: 14 },
    ];
    const { data: rows } = await supabase
      .from("apuracao_mensal")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("competencia", { ascending: false });
    (rows ?? []).forEach((r) =>
      sheet.addRow({
        competencia: r.competencia,
        status: r.status,
        debito_apurado: Number(r.debito_apurado ?? 0),
        credito_retencao: Number(r.credito_retencao ?? 0),
        creditos_anteriores: Number(r.creditos_anteriores ?? 0),
        valor_compensado: Number(r.valor_compensado ?? 0),
        inss_devido: Number(r.inss_devido ?? 0),
        inss_retido: Number(r.inss_retido ?? 0),
      })
    );
  }

  if (tipo === "creditos") {
    sheet.columns = [
      { header: "Competência Origem", key: "competencia_origem", width: 18 },
      { header: "Tipo", key: "tipo", width: 18 },
      { header: "Valor Original", key: "valor_original", width: 16 },
      { header: "Saldo Disponível", key: "saldo_disponivel", width: 16 },
      { header: "Descrição", key: "descricao", width: 30 },
    ];
    const { data: rows } = await supabase
      .from("credito_tributario")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });
    (rows ?? []).forEach((r) =>
      sheet.addRow({
        competencia_origem: r.competencia_origem,
        tipo: r.tipo,
        valor_original: Number(r.valor_original),
        saldo_disponivel: Number(r.saldo_disponivel),
        descricao: r.descricao ?? "",
      })
    );
  }

  if (tipo === "perdcomps") {
    sheet.columns = [
      { header: "Competência", key: "competencia", width: 14 },
      { header: "Tributo", key: "tributo", width: 14 },
      { header: "Protocolo", key: "protocolo", width: 20 },
      { header: "Débito", key: "debito", width: 16 },
      { header: "Crédito Utilizado", key: "credito_utilizado", width: 16 },
      { header: "Status", key: "status", width: 18 },
      { header: "Data Transmissão", key: "data_transmissao", width: 18 },
    ];
    const { data: rows } = await supabase
      .from("perdcomp")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });
    (rows ?? []).forEach((r) =>
      sheet.addRow({
        competencia: r.competencia,
        tributo: r.tributo,
        protocolo: r.protocolo ?? "",
        debito: Number(r.debito),
        credito_utilizado: Number(r.credito_utilizado),
        status: r.status,
        data_transmissao: r.data_transmissao
          ? new Date(r.data_transmissao).toLocaleDateString("pt-BR")
          : "",
      })
    );
  }

  if (tipo === "inss") {
    sheet.columns = [
      { header: "Competência", key: "competencia", width: 14 },
      { header: "Status", key: "status", width: 14 },
      { header: "Data Recolhimento", key: "data_recolhimento", width: 18 },
      { header: "Observação", key: "observacao", width: 30 },
    ];
    const { data: rows } = await supabase
      .from("controle_inss")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("competencia", { ascending: false });
    (rows ?? []).forEach((r) =>
      sheet.addRow({
        competencia: r.competencia,
        status: r.status,
        data_recolhimento: r.data_recolhimento
          ? new Date(r.data_recolhimento).toLocaleDateString("pt-BR")
          : "",
        observacao: r.observacao ?? "",
      })
    );
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="relatorio-${tipo}.xlsx"`,
    },
  });
}
