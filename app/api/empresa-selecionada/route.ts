import { NextResponse } from "next/server";
import { EMPRESA_COOKIE } from "@/lib/empresa-cookie";

export async function POST(request: Request) {
  const { empresaId } = await request.json();

  const response = NextResponse.json({ ok: true });

  if (!empresaId) {
    response.cookies.delete(EMPRESA_COOKIE);
  } else {
    response.cookies.set(EMPRESA_COOKIE, empresaId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
