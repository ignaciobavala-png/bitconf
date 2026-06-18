import { createClient } from "@supabase/supabase-js";

// Cliente para API routes — usa service_role key (puede INSERT/UPDATE)
// NUNCA exportar al cliente/browser
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
