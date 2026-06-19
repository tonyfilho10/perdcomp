"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

const PERFIS = ["ADMIN", "SENIOR"] as const;

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");
  if (user.perfil !== "ADMIN") throw new Error("Apenas administradores podem gerenciar usuários.");
  return user;
}

export async function criarUsuario(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nome = String(formData.get("nome") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const confirmarSenha = String(formData.get("confirmarSenha") ?? "");
  const perfil = String(formData.get("perfil") ?? "");

  if (!email || !nome || senha.length < 6) {
    throw new Error("Verifique e-mail, nome e senha (mínimo 6 caracteres).");
  }
  if (senha !== confirmarSenha) {
    throw new Error("As senhas não coincidem.");
  }
  if (!PERFIS.includes(perfil as (typeof PERFIS)[number])) {
    throw new Error("Perfil inválido.");
  }

  const senha_hash = await bcrypt.hash(senha, 10);

  const supabase = createAdminClient();
  const { error } = await supabase.from("usuario").insert({
    email,
    nome,
    senha_hash,
    perfil,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/usuarios");
}

export async function desativarUsuario(usuarioId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("usuario")
    .update({ ativo: false })
    .eq("id", usuarioId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/usuarios");
}
