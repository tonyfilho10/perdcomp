"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const TRIBUTOS = ["PIS", "COFINS", "PIS_COFINS"] as const;

export async function criarPerdcomp(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");

  const empresa_id = String(formData.get("empresaId") ?? "");
  const apuracao_id = String(formData.get("apuracaoId") ?? "");
  const competencia = String(formData.get("competencia") ?? "").trim();
  const tributo = String(formData.get("tributo") ?? "");
  const debito = Number(formData.get("debito") ?? 0);
  const credito_utilizado = Number(formData.get("creditoUtilizado") ?? 0);
  const credito_id = String(formData.get("creditoId") ?? "") || null;

  if (
    !empresa_id ||
    !apuracao_id ||
    !competencia ||
    !TRIBUTOS.includes(tributo as (typeof TRIBUTOS)[number]) ||
    debito < 0 ||
    credito_utilizado < 0
  ) {
    throw new Error("Dados inválidos para a PERDCOMP.");
  }

  if (credito_utilizado > 0 && !credito_id) {
    throw new Error("Selecione o crédito a ser utilizado.");
  }

  await prisma.$transaction(async (tx) => {
    if (credito_id && credito_utilizado > 0) {
      const credito = await tx.credito_tributario.findUnique({
        where: { id: credito_id },
      });
      if (!credito || credito.empresa_id !== empresa_id) {
        throw new Error("Crédito inválido.");
      }
      if (Number(credito.saldo_disponivel) < credito_utilizado) {
        throw new Error("Saldo de crédito disponível insuficiente.");
      }
    }

    const perdcomp = await tx.perdcomp.create({
      data: {
        empresa_id,
        apuracao_id,
        usuario_id: user.id,
        competencia,
        tributo: tributo as (typeof TRIBUTOS)[number],
        debito,
        credito_utilizado,
      },
    });

    if (credito_id && credito_utilizado > 0) {
      await tx.credito_tributario.update({
        where: { id: credito_id },
        data: { saldo_disponivel: { decrement: credito_utilizado } },
      });

      await tx.credito_utilizacao.create({
        data: {
          credito_id,
          perdcomp_id: perdcomp.id,
          valor: credito_utilizado,
        },
      });
    }

    await tx.audit_log.create({
      data: {
        usuario_id: user.id,
        acao: "CRIAR",
        entidade: "perdcomp",
        entidade_id: perdcomp.id,
        dados_depois: {
          competencia,
          tributo,
          debito,
          credito_utilizado,
        },
      },
    });
  });

  revalidatePath("/dashboard/perdcomps");
  revalidatePath("/dashboard/creditos");
}

export async function transmitirPerdcomp(perdcompId: string) {
  await getAuthOrThrow();
  await prisma.perdcomp.update({
    where: { id: perdcompId },
    data: { status: "TRANSMITIDA", data_transmissao: new Date() },
  });
  revalidatePath("/dashboard/perdcomps");
}

export async function homologarPerdcomp(perdcompId: string) {
  await getAuthOrThrow();
  await prisma.perdcomp.update({
    where: { id: perdcompId },
    data: { status: "HOMOLOGADA", data_despacho: new Date() },
  });
  revalidatePath("/dashboard/perdcomps");
}

export async function indeferirPerdcomp(perdcompId: string, motivo: string) {
  await getAuthOrThrow();
  await prisma.perdcomp.update({
    where: { id: perdcompId },
    data: {
      status: "INDEFERIDA",
      data_despacho: new Date(),
      motivo_indeferimento: motivo,
    },
  });
  revalidatePath("/dashboard/perdcomps");
}

export async function cancelarPerdcomp(perdcompId: string) {
  const user = await getAuthOrThrow();

  await prisma.$transaction(async (tx) => {
    const utilizacoes = await tx.credito_utilizacao.findMany({
      where: { perdcomp_id: perdcompId },
    });

    for (const u of utilizacoes) {
      await tx.credito_tributario.update({
        where: { id: u.credito_id },
        data: { saldo_disponivel: { increment: u.valor } },
      });
    }

    await tx.perdcomp.update({
      where: { id: perdcompId },
      data: { status: "CANCELADA" },
    });

    await tx.audit_log.create({
      data: {
        usuario_id: user.id,
        acao: "CANCELAR",
        entidade: "perdcomp",
        entidade_id: perdcompId,
      },
    });
  });

  revalidatePath("/dashboard/perdcomps");
  revalidatePath("/dashboard/creditos");
}

async function getAuthOrThrow() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");
  return user;
}
