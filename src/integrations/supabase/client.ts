import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/integrations/supabase/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !anon) {
  const missing = [
    !url && "NEXT_PUBLIC_SUPABASE_URL",
    !anon && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter(Boolean);

  throw new Error(
    `Variáveis ausentes: ${missing.join(", ")}. Verifique o .env.local na raiz do projeto e reinicie o servidor.`
  );
}

// Client padrão (schema public)
export const supabase = createBrowserClient<Database>(url, anon, {
  cookieOptions: {
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
  },
});
