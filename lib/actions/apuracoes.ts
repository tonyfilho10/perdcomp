"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function criarApuracao(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");

  const empresa_id = String(formData.get("empresaId") ?? "");
  const competencia = String(formData.get("competencia") ?? "").trim();

  if (!empresa_id || !/^\d{4}-\d{2}$/.test(competencia)) {
    throw new Error("Competência inválida. Use o formato AAAA-MM.");
  }

  await prisma.apuracao_mensal.create({
    data: { empresa_id, competencia },
  });

  revalidatePath("/dashboard/perdcomps");
  revalidatePath("/dashboard/inss");
  revalidatePath("/dashboard/apuracoes");
}

export async function fecharApuracao(apuracaoId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");

  const apuracao = await prisma.apuracao_mensal.findUnique({
    where: { id: apuracaoId },
  });
  if (!apuracao) throw new Error("Apuração não encontrada.");
  if (apuracao.status === "FECHADA") throw new Error("Apuração já está fechada.");

  await prisma.$transaction(async (tx) => {
    await tx.apuracao_mensal.update({
      where: { id: apuracaoId },
      data: {
        status: "FECHADA",
        fechado_por_id: user.id,
        fechado_em: new Date(),
      },
    });

    await tx.audit_log.create({
      data: {
        usuario_id: user.id,
        acao: "FECHAR",
        entidade: "apuracao_mensal",
        entidade_id: apuracaoId,
      },
    });
  });

  revalidatePath("/dashboard/apuracoes");
}
