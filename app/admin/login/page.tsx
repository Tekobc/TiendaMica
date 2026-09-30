"use client";

import { useState } from "react";
import { Sparkles, Shield, AlertCircle, LogIn, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const siteUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/admin`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con Google OAuth.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-rose-100 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-mica-500 to-mica-400 flex items-center justify-center text-white mb-4 shadow-md shadow-mica-200">
          <Lock className="w-7 h-7" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-mica-700 font-serif">
          ADONAI BY TIENDA MICA
        </span>
        <h1 className="text-2xl font-serif font-bold text-stone-900 mt-1 mb-2">
          Acceso Administrador
        </h1>
        <p className="text-xs text-stone-500 mb-6">
          Ingreso exclusivo para gestión de sorteos, participantes y métricas de recaudación.
        </p>

        {error && (
          <div className="w-full p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 mb-4 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="w-full p-4 rounded-2xl bg-sage-50/70 border border-sage-200 text-left mb-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sage-800 mb-1">
            <Shield className="w-4 h-4 text-sage-600" />
            <span>Seguridad Server-Side (Whitelist)</span>
          </div>
          <p className="text-[11px] text-sage-700 leading-relaxed">
            El acceso requiere autenticación mediante Google y verificación estricta de tu correo en la tabla <code>admins_whitelist</code> del servidor.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Iniciar sesión con Google</span>
        </button>

        {/* Acceso de Prueba / Sandbox (Fase 2 MVP) */}
        <div className="w-full mt-4 pt-4 border-t border-stone-100 flex flex-col gap-2">
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              const { loginDevAdminAction } = await import("@/lib/actions/admin-actions");
              await loginDevAdminAction();
              window.location.href = "/admin";
            }}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-mica-600" />
            <span>Acceso Modo Pruebas / Sandbox (MVP)</span>
          </button>
          <span className="text-[10px] text-stone-400">
            Habilitado para pruebas del circuito completo sin OAuth externo
          </span>
        </div>

        <a
          href="/sorteos"
          className="mt-6 text-xs text-stone-500 hover:text-mica-600 transition-colors"
        >
          &larr; Volver al sitio público
        </a>
      </div>
    </div>
  );
}
