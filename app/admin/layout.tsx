import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getAuthenticatedAdmin();

  // El middleware ya garantiza que si llegamos acá hay sesión de Supabase Auth.
  // Solo queda verificar la whitelist (CONTEXT.md Sección 10): si el email no está autorizado → 403.
  if (adminUser && !adminUser.isAuthorized) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-red-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-900 mb-2">
            403 — Acceso No Autorizado
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed mb-4">
            El correo <strong>{adminUser.email}</strong> no se encuentra en la
            lista de administradores autorizados (
            <code>admins_whitelist</code>).
          </p>
          <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 mb-6 text-left">
            Por razones de seguridad, iniciar sesión con Google solo autentica
            tu identidad pero no otorga permisos de administración a menos que
            el email esté previamente dado de alta por el titular.
          </div>
          <Link
            href="/sorteos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al sitio público</span>
          </Link>
        </div>
      </div>
    );
  }

  // Usuario autenticado y autorizado (o modo sin Supabase configurado para desarrollo local)
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2d2627] flex flex-col">
      {children}
    </div>
  );
}

