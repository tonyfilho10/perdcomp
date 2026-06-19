import { cookies } from "next/headers";

export const EMPRESA_COOKIE = "perdcomp_empresa";

export async function getSelectedEmpresaId() {
  const cookieStore = await cookies();
  return cookieStore.get(EMPRESA_COOKIE)?.value ?? null;
}
