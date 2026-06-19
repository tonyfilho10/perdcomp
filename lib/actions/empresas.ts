"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const REGIMES = ["SIMPLES", "LUCRO_PRESUMIDO", "LUCRO_REAL"] as const;

export async function criarEmpresa(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");

  const razao_social = String(formData.get("razaoSocial") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").replace(/\D/g, "");
  const regime_tributario = String(formData.get("regimeTributario") ?? "");
  const responsavel_interno = String(formData.get("responsavelInterno") ?? "").trim();

  if (!razao_social || cnpj.length !== 14 || !responsavel_interno) {
    throw new Error("Dados inválidos: verifique razão social, CNPJ (14 dígitos) e responsável.");
  }

  if (!REGIMES.includes(regime_tributario as (typeof REGIMES)[number])) {
    throw new Error("Regime tributário inválido");
  }

  await prisma.empresa.create({
    data: {
      razao_social,
      cnpj,
      regime_tributario: regime_tributario as (typeof REGIMES)[number],
      responsavel_interno,
    },
  });

  revalidatePath("/dashboard/empresas");
}

export async function desativarEmpresa(empresaId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");

  await prisma.empresa.update({
    where: { id: empresaId },
    data: { ativa: false },
  });

  revalidatePath("/dashboard/empresas");
}
