"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const TIPOS = [
  "RETENCAO",
  "SALDO_NEGATIVO",
  "ESTIMATIVA",
  "PAGAMENTO_INDEVIDO",
] as const;

export async function criarCredito(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");

  const empresa_id = String(formData.get("empresaId") ?? "");
  const competencia_origem = String(formData.get("competenciaOrigem") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "");
  const valor_original = Number(formData.get("valorOriginal") ?? 0);
  const descricao = String(formData.get("descricao") ?? "").trim() || null;

  if (!empresa_id || !competencia_origem || !TIPOS.includes(tipo as (typeof TIPOS)[number]) || valor_original <= 0) {
    throw new Error("Dados inválidos: verifique empresa, competência, tipo e valor.");
  }

  await prisma.credito_tributario.create({
    data: {
      empresa_id,
      competencia_origem,
      tipo: tipo as (typeof TIPOS)[number],
      valor_original,
      saldo_disponivel: valor_original,
      descricao,
    },
  });

  revalidatePath("/dashboard/creditos");
}
