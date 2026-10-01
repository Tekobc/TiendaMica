import { createClient } from '@supabase/supabase-js';

// Cliente administrativo con service_role.
// REGLA: Usar EXCLUSIVAMENTE en el servidor (Server Actions, webhooks, middleware), NUNCA en componentes cliente.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !serviceKey) {
    throw new Error('Variables de entorno SUPABASE no configuradas para service_role.');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
