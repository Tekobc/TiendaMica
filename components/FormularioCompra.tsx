"use client";

import { useState, useRef, useEffect } from "react";
import { Sorteo } from "@/lib/types";
import { ProgressBar } from "@/components/ProgressBar";
import { reservarNumerosAction } from "@/lib/actions/reservar-numeros";
import {
  User,
  Phone,
  Hash,
  ShieldCheck,
  CreditCard,
  Loader2,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface FormularioCompraProps {
  sorteo: Sorteo;
  disponibles: number;
  onSuccess?: (initPoint: string) => void;
  mostrarProgreso?: boolean;
}

export function FormularioCompra({ sorteo, disponibles, onSuccess, mostrarProgreso = true }: FormularioCompraProps) {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const phoneRef = useRef<HTMLInputElement>(null);
  const cantidadRef = useRef<HTMLInputElement>(null);

  const maxPermitido = Math.min(sorteo.tope_por_compra, disponibles);

  // Validación de teléfono argentino en vivo: mínimo 10 dígitos (código de área + número)
  const cleanedPhone = telefono.replace(/\D/g, "");
  const isPhoneValid = cleanedPhone.length >= 10 && cleanedPhone.length <= 13;
  const isNombreValid = nombreCompleto.trim().length >= 3;
  const isCantidadValid = cantidad >= 1 && cantidad <= maxPermitido;

  const totalCalculado = cantidad * sorteo.precio_numero;
  const canSubmit = isNombreValid && isPhoneValid && isCantidadValid && aceptaTerminos && !loading;

  // Avance dinámico de foco (CONTEXT.md Sección 9.2):
  // Al completar nombre válido y presionar Enter o perder foco, avanza a teléfono
  const handleNombreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isNombreValid) {
      e.preventDefault();
      phoneRef.current?.focus();
    }
  };

  const handleNombreBlur = () => {
    if (isNombreValid && !telefono) {
      phoneRef.current?.focus();
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isPhoneValid) {
      e.preventDefault();
      cantidadRef.current?.focus();
    }
  };

  const handlePhoneBlur = () => {
    if (isPhoneValid) {
      cantidadRef.current?.focus();
    }
  };

  // Al completar la longitud estándar de teléfono (10 dígitos en AR), avanza a cantidad
  useEffect(() => {
    if (cleanedPhone.length === 10) {
      // Pequeño retardo sutil para no cortar el tipeo abruptamente
      const timer = setTimeout(() => {
        cantidadRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [cleanedPhone.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await reservarNumerosAction({
        sorteoId: sorteo.id,
        nombreCompleto: nombreCompleto.trim(),
        telefono: cleanedPhone,
        cantidad,
      });

      if (!res.ok || !res.initPoint) {
        setErrorMessage(res.error || "No se pudo iniciar el pago. Intentá nuevamente.");
        setLoading(false);
        return;
      }

      if (onSuccess) {
        onSuccess(res.initPoint);
      }

      // Redirigir a la pasarela de Mercado Pago
      window.location.href = res.initPoint;
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Ocurrió un error al contactar al servidor. Comprobá tu conexión.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 text-stone-800 sm:gap-3">
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Nombre completo */}
      <div>
        <label htmlFor="nombreCompleto" className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-stone-400 dark:text-stone-300" aria-hidden="true" />
            Nombre y Apellido
          </span>
          {isNombreValid && (
            <span className="text-[11px] text-sage-600 dark:text-sage-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Correcto
            </span>
          )}
        </label>
        <input
          id="nombreCompleto"
          type="text"
          name="nombreCompleto"
          autoComplete="name"
          required
          placeholder="Ej: Micaela Gómez"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          onKeyDown={handleNombreKeyDown}
          onBlur={handleNombreBlur}
          className="w-full min-h-10 px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-mica-400 focus-visible:bg-white dark:bg-[#282025] dark:border-rose-500/20 dark:text-stone-100 dark:focus-visible:bg-[#20191d] transition-all shadow-2xs"
        />
      </div>

      {/* 2. Teléfono (Teclado numérico, validación celular argentino) */}
      <div>
        <label htmlFor="telefono" className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-stone-400 dark:text-stone-300" aria-hidden="true" />
            Teléfono Celular (WhatsApp)
          </span>
          {isPhoneValid ? (
            <span className="text-[11px] text-sage-600 dark:text-sage-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Formato válido
            </span>
          ) : (
            <span className="text-[11px] text-stone-400 dark:text-stone-300">10 dígitos con código de área</span>
          )}
        </label>
        <input
          id="telefono"
          ref={phoneRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          pattern="[0-9]*"
          required
          placeholder="Ej: 11 2345 6789 (sin 0 ni 15)"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          onKeyDown={handlePhoneKeyDown}
          onBlur={handlePhoneBlur}
          className={`w-full min-h-10 px-3 py-2 border rounded-xl text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-mica-400 focus-visible:bg-white dark:focus-visible:bg-[#20191d] transition-all shadow-2xs ${
            telefono && !isPhoneValid
              ? "border-amber-300 bg-amber-50/30 dark:bg-amber-950/20 dark:border-amber-500/30"
              : isPhoneValid
              ? "border-sage-400 bg-sage-50/30 dark:bg-sage-950/20 dark:border-sage-500/30"
              : "border-stone-200 bg-stone-50/70 dark:bg-[#282025] dark:border-rose-500/20 dark:text-stone-100"
          }`}
        />
        <p className="text-[10px] leading-tight text-stone-400 dark:text-stone-300 mt-1">
          Te contactaremos a este número en caso de resultar ganador/a.
        </p>
      </div>

      {/* 3. Cantidad de números */}
      <div>
        <label htmlFor="cantidad" className="block text-xs font-semibold text-stone-700 dark:text-stone-200 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-stone-400 dark:text-stone-300" aria-hidden="true" />
            Cantidad de números (Máximo {maxPermitido})
          </span>
          <span className="text-[11px] text-stone-500 dark:text-stone-300 font-medium tabular-nums">
            Disponibles: {disponibles}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Disminuir cantidad de números"
            onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
            disabled={cantidad <= 1 || loading}
            className="w-10 h-10 min-w-10 rounded-xl bg-white dark:bg-[#282025] border border-stone-200 dark:border-rose-500/20 text-stone-700 dark:text-stone-200 text-lg font-bold hover:bg-stone-50 dark:hover:bg-[#32282f] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-mica-400"
          >
            -
          </button>
          <input
            id="cantidad"
            ref={cantidadRef}
            type="number"
            min={1}
            max={maxPermitido}
            value={cantidad}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setCantidad(Math.min(maxPermitido, Math.max(1, val)));
            }}
            className="flex-1 min-h-10 text-center py-2 bg-stone-50/70 dark:bg-[#282025] border border-stone-200 dark:border-rose-500/20 rounded-xl font-bold text-stone-900 dark:text-stone-100 text-base shadow-2xs tabular-nums focus:outline-hidden focus-visible:ring-2 focus-visible:ring-mica-400 focus-visible:bg-white dark:focus-visible:bg-[#20191d]"
          />
          <button
            type="button"
            aria-label="Aumentar cantidad de números"
            onClick={() => setCantidad((prev) => Math.min(maxPermitido, prev + 1))}
            disabled={cantidad >= maxPermitido || loading}
            className="w-10 h-10 min-w-10 rounded-xl bg-white dark:bg-[#282025] border border-stone-200 dark:border-rose-500/20 text-stone-700 dark:text-stone-200 text-lg font-bold hover:bg-stone-50 dark:hover:bg-[#32282f] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-mica-400"
          >
            +
          </button>
        </div>
      </div>

      {mostrarProgreso && (
        <ProgressBar
          total={sorteo.cantidad_numeros}
          ocupados={sorteo.cantidad_numeros - disponibles}
        />
      )}

      <div className="px-3 py-2 rounded-xl bg-sage-50/70 border border-sage-200 text-[11px] text-sage-800 dark:bg-sage-950/20 dark:border-sage-500/30 dark:text-sage-200 leading-snug">
        Pago seguro con Mercado Pago • Tu número se asigna automáticamente al confirmarse el pago.
      </div>

      {/* Resumen de cobro calculado en tiempo real (RN-03) */}
      <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 dark:bg-[#282025] dark:border-rose-500/20 flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-500 dark:text-stone-300 block font-medium tabular-nums">
            {cantidad} número{cantidad > 1 ? "s" : ""}&nbsp;×&nbsp;${sorteo.precio_numero.toLocaleString("es-AR")}
          </span>
          <span className="text-[11px] text-sage-700 dark:text-sage-300 font-semibold flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" aria-hidden="true" />
            Asignación correlativa al pagar
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 dark:text-stone-300 block font-medium uppercase tracking-wider">Total a Pagar</span>
          <span className="text-xl font-serif font-bold text-mica-700 dark:text-mica-300 tabular-nums">
            ${totalCalculado.toLocaleString("es-AR")}
          </span>
        </div>
      </div>

      {/* Checkbox obligatorio: Mayoría de edad y Bases y Condiciones */}
      <label className="flex items-start gap-2 cursor-pointer text-xs leading-snug text-stone-600 dark:text-stone-200 select-none">
        <input
          type="checkbox"
          checked={aceptaTerminos}
          onChange={(e) => setAceptaTerminos(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded-md border-stone-300 text-mica-600 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-mica-400 transition-all cursor-pointer"
        />
        <span>
          Soy mayor de 18 años y acepto las{" "}
          <Link
            href="/dinamica/bases-y-condiciones"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mica-600 dark:text-mica-400 font-medium hover:underline inline-flex items-center gap-0.5 focus:outline-hidden focus-visible:ring-1 focus-visible:ring-mica-400 rounded-xs"
          >
            Bases y Condiciones <ExternalLink className="w-3 h-3 inline" aria-hidden="true" />
            <span className="sr-only">(se abre en una nueva pestaña)</span>
          </Link>{" "}
          de la dinámica de Adonai BY TIENDA MICA.
        </span>
      </label>

      {/* Botón Pagar con Mercado Pago */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full min-h-12 py-3 px-4 rounded-xl bg-gradient-to-r from-mica-500 to-mica-600 hover:from-mica-600 hover:to-mica-700 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-mica-200/90 dark:shadow-none hover:shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-mica-500"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Procesando tu pago con Mercado Pago…</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 text-white/90" aria-hidden="true" />
            <span className="tabular-nums">Pagar con Mercado Pago • ${totalCalculado.toLocaleString("es-AR")}</span>
          </>
        )}
      </button>
    </form>
  );
}
