"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const supabase = createAdminClient();

  let credito: { id: string; empresa_id: string; saldo_disponivel: number } | null = null;
  if (credito_id && credito_utilizado > 0) {
    const { data, error } = await supabase
      .from("credito_tributario")
      .select("id, empresa_id, saldo_disponivel")
      .eq("id", credito_id)
      .single();
    if (error || !data || data.empresa_id !== empresa_id) {
      throw new Error("Crédito inválido.");
    }
    if (Number(data.saldo_disponivel) < credito_utilizado) {
      throw new Error("Saldo de crédito disponível insuficiente.");
    }
    credito = data;
  }

  const { data: perdcomp, error: insertError } = await supabase
    .from("perdcomp")
    .insert({
      empresa_id,
      apuracao_id,
      usuario_id: user.id,
      competencia,
      tributo,
      debito,
      credito_utilizado,
    })
    .select("id")
    .single();

  if (insertError || !perdcomp) {
    throw new Error(insertError?.message ?? "Erro ao criar PERDCOMP");
  }

  if (credito && credito_id) {
    await supabase
      .from("credito_tributario")
      .update({
        saldo_disponivel: Number(credito.saldo_disponivel) - credito_utilizado,
      })
      .eq("id", credito_id);

    await supabase.from("credito_utilizacao").insert({
      credito_id,
      perdcomp_id: perdcomp.id,
      valor: credito_utilizado,
    });
  }

  await supabase.from("audit_log").insert({
    usuario_id: user.id,
    acao: "CRIAR",
    entidade: "perdcomp",
    entidade_id: perdcomp.id,
    dados_depois: { competencia, tributo, debito, credito_utilizado },
  });

  revalidatePath("/dashboard/perdcomps");
  revalidatePath("/dashboard/creditos");
}

export async function transmitirPerdcomp(perdcompId: string) {
  await getAuthOrThrow();
  const supabase = createAdminClient();
  await supabase
    .from("perdcomp")
    .update({ status: "TRANSMITIDA", data_transmissao: new Date().toISOString() })
    .eq("id", perdcompId);
  revalidatePath("/dashboard/perdcomps");
}

export async function homologarPerdcomp(perdcompId: string) {
  await getAuthOrThrow();
  const supabase = createAdminClient();
  await supabase
    .from("perdcomp")
    .update({ status: "HOMOLOGADA", data_despacho: new Date().toISOString() })
    .eq("id", perdcompId);
  revalidatePath("/dashboard/perdcomps");
}

export async function indeferirPerdcomp(perdcompId: string, motivo: string) {
  await getAuthOrThrow();
  const supabase = createAdminClient();
  await supabase
    .from("perdcomp")
    .update({
      status: "INDEFERIDA",
      data_despacho: new Date().toISOString(),
      motivo_indeferimento: motivo,
    })
    .eq("id", perdcompId);
  revalidatePath("/dashboard/perdcomps");
}

export async function cancelarPerdcomp(perdcompId: string) {
  const user = await getAuthOrThrow();
  const supabase = createAdminClient();

  const { data: utilizacoes } = await supabase
    .from("credito_utilizacao")
    .select("credito_id, valor")
    .eq("perdcomp_id", perdcompId);

  for (const u of utilizacoes ?? []) {
    const { data: credito } = await supabase
      .from("credito_tributario")
      .select("saldo_disponivel")
      .eq("id", u.credito_id)
      .single();
    if (credito) {
      await supabase
        .from("credito_tributario")
        .update({
          saldo_disponivel: Number(credito.saldo_disponivel) + Number(u.valor),
        })
        .eq("id", u.credito_id);
    }
  }

  await supabase.from("perdcomp").update({ status: "CANCELADA" }).eq("id", perdcompId);

  await supabase.from("audit_log").insert({
    usuario_id: user.id,
    acao: "CANCELAR",
    entidade: "perdcomp",
    entidade_id: perdcompId,
  });

  revalidatePath("/dashboard/perdcomps");
  revalidatePath("/dashboard/creditos");
}

async function getAuthOrThrow() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");
  return user;
}
