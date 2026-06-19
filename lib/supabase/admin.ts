import { createClient } from "@supabase/supabase-js";

// Usa a service_role key — ignora RLS. Só pode ser importado em código server-side
// (API routes, Server Components, Server Actions), nunca em "use client".
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
