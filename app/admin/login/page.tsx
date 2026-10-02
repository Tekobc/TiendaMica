"use client";

import { useState } from "react";
import { Sparkles, Shield, AlertCircle, LogIn, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setError("Correo o contraseña incorrectos, o cuenta sin confirmar.");
        return;
      }

      window.location.assign("/admin");
    } catch (err: any) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
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
          Ingreso exclusivo para gestión de la dinámica, participantes y métricas de recaudación.
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
            El acceso requiere una cuenta de Supabase y que su correo figure en <code>admins_whitelist</code>.
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3 text-left">
          <label className="text-xs font-semibold text-stone-700">
            Correo electrónico
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-3 text-sm font-normal focus:border-mica-500 focus:outline-none focus:ring-2 focus:ring-mica-200"
            />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-3 text-sm font-normal focus:border-mica-500 focus:outline-none focus:ring-2 focus:ring-mica-200"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Ingresando..." : "Iniciar sesión"}</span>
          </button>
        </form>

        {process.env.NODE_ENV !== "production" && (
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
            Solo disponible en desarrollo local
          </span>
        </div>
        )}

        <a
          href="/dinamica"
          className="mt-6 text-xs text-stone-500 hover:text-mica-600 transition-colors"
        >
          &larr; Volver al sitio público
        </a>
      </div>
    </div>
  );
}
