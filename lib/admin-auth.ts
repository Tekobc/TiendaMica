import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export interface AdminUser {
  email: string;
  isAuthorized: boolean;
}

// Verifica de forma segura en el SERVIDOR si el usuario tiene sesión y está en admins_whitelist
export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const devCookie = process.env.NODE_ENV !== "production"
      ? cookieStore.get("admin_dev_session")?.value
      : undefined;

    if (error || !user || !user.email) {
      if (devCookie && process.env.NODE_ENV !== "production") {
        return { email: devCookie, isAuthorized: true };
      }
      return null;
    }

    const email = user.email.toLowerCase();

    // Validar contra la whitelist en el servidor con service_role (CONTEXT.md Sección 10)
    try {
      const adminClient = createAdminClient();
      const { data: whitelistEntry, error: whitelistError } = await adminClient
        .from("admins_whitelist")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (whitelistError || !whitelistEntry) {
        console.warn(`[Admin Auth] Acceso denegado: ${email} no figura en admins_whitelist.`);
        return { email, isAuthorized: false };
      }

      return { email, isAuthorized: true };
    } catch {
      return { email, isAuthorized: false };
    }
  } catch (e) {
    try {
      const cookieStore = await cookies();
      const devCookie = process.env.NODE_ENV !== "production"
        ? cookieStore.get("admin_dev_session")?.value
        : undefined;
      if (devCookie && process.env.NODE_ENV !== "production") {
        return { email: devCookie, isAuthorized: true };
      }
    } catch {}
    return null;
  }
}
