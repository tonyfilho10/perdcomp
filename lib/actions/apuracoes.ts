"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

export async function criarApuracao(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");

  const empresa_id = String(formData.get("empresaId") ?? "");
  const competencia = String(formData.get("competencia") ?? "").trim();

  if (!empresa_id || !/^\d{4}-\d{2}$/.test(competencia)) {
    throw new Error("Competência inválida. Use o formato AAAA-MM.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("apuracao_mensal")
    .insert({ empresa_id, competencia });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/perdcomps");
  revalidatePath("/dashboard/inss");
  revalidatePath("/dashboard/apuracoes");
}

export async function fecharApuracao(apuracaoId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");

  const supabase = createAdminClient();

  const { data: apuracao, error: findError } = await supabase
    .from("apuracao_mensal")
    .select("status")
    .eq("id", apuracaoId)
    .single();

  if (findError || !apuracao) throw new Error("Apuração não encontrada.");
  if (apuracao.status === "FECHADA") throw new Error("Apuração já está fechada.");

  const { error: updateError } = await supabase
    .from("apuracao_mensal")
    .update({
      status: "FECHADA",
      fechado_por_id: user.id,
      fechado_em: new Date().toISOString(),
    })
    .eq("id", apuracaoId);

  if (updateError) throw new Error(updateError.message);

  await supabase.from("audit_log").insert({
    usuario_id: user.id,
    acao: "FECHAR",
    entidade: "apuracao_mensal",
    entidade_id: apuracaoId,
  });

  revalidatePath("/dashboard/apuracoes");
}
