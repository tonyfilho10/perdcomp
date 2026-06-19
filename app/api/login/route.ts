import { NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const { email, senha } = await request.json();

  if (!email || !senha) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc("verificar_login", {
    p_email: String(email).toLowerCase(),
    p_senha: senha,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos" },
      { status: 401 }
    );
  }

  const usuario = data[0];
  const token = await createSessionToken({
    id: usuario.id,
    email: usuario.email,
    nome: usuario.nome,
    perfil: usuario.perfil,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
