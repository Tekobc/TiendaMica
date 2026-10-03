"use client";

import { useState } from "react";
import { Compra, Sorteo, NumeroItem } from "@/lib/types";
import { ProgressBar } from "@/components/ProgressBar";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  Share2,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface MisNumerosClientProps {
  compra: Compra;
  sorteo: Sorteo;
  misNumeros: number[];
  todosLosNumeros: NumeroItem[];
}

export function MisNumerosClient({
  compra,
  sorteo,
  misNumeros,
  todosLosNumeros,
}: MisNumerosClientProps) {
  const [copied, setCopied] = useState(false);
  const whatsappChannelUrl = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || "";
  const publicResultsText =
    process.env.NEXT_PUBLIC_PUBLIC_RESULTS_TEXT ||
    "Cuando finalice la dinámica, el resultado se publicará en el canal de WhatsApp.";
  const sortedNumbers = [...misNumeros].sort((a, b) => a - b);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const ocupados = todosLosNumeros.filter((n) => n.ocupado).length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <Link
        href="/dinamica"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-mica-600 transition-colors w-fit dark:text-stone-300 dark:hover:text-mica-300"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la portada de la dinámica</span>
      </Link>

      {/* Estado del Pago */}
      {compra.estado_pago === "pagado" && (
        <section className="bg-gradient-to-br from-sage-50 via-white to-cream-50 border border-sage-200/90 rounded-3xl p-5 sm:p-7 shadow-xs dark:border-sage-500/20 dark:from-[#1d2921] dark:via-[#201b1d] dark:to-[#1d1a1b]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-sage-700 text-[11px] font-bold uppercase tracking-wider dark:text-sage-200">
              <CheckCircle2 className="w-4 h-4 text-sage-600 dark:text-sage-300" />
              <span>Pago confirmado • ¡Ya estás participando!</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src="/logo-adonai.svg"
                alt="Adonai BY TIENDA MICA"
                className="h-12 w-12 rounded-2xl object-contain bg-white/80 p-1 ring-1 ring-rose-100/80 dark:bg-[#241d20] dark:ring-rose-500/20"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  🎉 ¡Ya estás participando!
                </h1>
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  Tu pago fue recibido correctamente. 💖
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/90 p-5 border border-rose-100 shadow-2xs dark:bg-[#241d20] dark:border-rose-500/20">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-mica-700 dark:text-mica-300">
                🍀 ¡Estos son tus números!
              </span>
              <div className="flex flex-wrap gap-2.5">
                {sortedNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-mica-500 to-mica-600 text-white font-mono font-bold text-base sm:text-lg shadow-sm shadow-mica-200 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-rose-200" />
                    #{String(num).padStart(2, "0")}
                  </span>
                ))}
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                💖 Gracias, <span className="font-semibold text-stone-800 dark:text-stone-100">{compra.nombre_completo}</span>
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {whatsappChannelUrl ? (
              <a
                href={whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-200/80 transition-colors hover:bg-emerald-700 dark:shadow-emerald-900/50"
              >
                <MessageCircle className="h-4 w-4" />
                <span>💬 Unirme al canal de WhatsApp</span>
              </a>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-[#2a2318] dark:text-amber-100">
                El enlace del canal de WhatsApp todavía no fue informado por el cliente. Cuando lo recibamos, se activará este botón.
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-[#2a2318] dark:text-amber-100">
              <div className="flex items-start gap-2.5">
                <Share2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 dark:text-amber-300" />
                <span>
                  <strong>✨ Hacé una captura de pantalla</strong> para guardar tus numeritos.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Copy className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 dark:text-amber-300" />
                <span>
                  <strong>Guardá este enlace:</strong> esta URL privada es el comprobante oficial para volver a ver tus números cuando quieras.
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="self-start rounded-xl bg-white border border-amber-300 px-3 py-2 font-semibold text-amber-900 hover:bg-amber-100/60 transition-all dark:border-amber-500/40 dark:bg-[#352f2a] dark:text-amber-100"
              >
                {copied ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-sage-600 dark:text-sage-300" />
                    ¡Enlace copiado!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    Copiar enlace
                  </span>
                )}
              </button>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-300">
              {publicResultsText}
            </p>
          </div>
        </section>
      )}

      {compra.estado_pago === "pendiente" && (
        <section className="bg-gradient-to-br from-amber-50 via-white to-rose-50 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>Pago en procesamiento</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
            Tu pago está siendo validado
          </h1>
          <p className="text-sm text-stone-600 mb-4">
            Estamos verificando la acreditación de Mercado Pago. Si acabás de abonar, recargá esta pantalla en unos segundos.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="py-2.5 px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Actualizar estado
            </button>
          </div>
        </section>
      )}

      {(compra.estado_pago === "fallido" || compra.estado_pago === "reembolsado") && (
        <section className="bg-gradient-to-br from-red-50 via-white to-stone-50 border border-red-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Pago no completado o reembolso emitido</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
            No se pudo completar la compra
          </h1>
          <p className="text-sm text-stone-600 mb-5">
            La operación fue rechazada por el medio de pago o se reembolsó por falta de stock disponible. Podés volver a la dinámica para intentarlo nuevamente.
          </p>
          <Link
            href="/dinamica"
            className="py-3 px-5 rounded-2xl bg-mica-600 text-white text-sm font-semibold hover:bg-mica-700 transition-colors inline-block"
          >
            Volver a la dinámica
          </Link>
        </section>
      )}

      {/* Barra de progreso */}
      <ProgressBar total={sorteo.cantidad_numeros} ocupados={ocupados} />

      {/* Tablero interactivo con los números del participante resaltados */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-rose-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Tablero de la Dinámica
            </h2>
            <p className="text-xs text-stone-500">
              Tus números asignados están destacados en color rosa intenso.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-r from-mica-500 to-mica-600 inline-block" />
              <span className="text-stone-700 font-bold">Tus números ({misNumeros.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-50 border border-rose-200 inline-block" />
              <span className="text-stone-500">Otros vendidos</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {todosLosNumeros.map((item) => {
            const isMine = misNumeros.includes(item.numero);
            const formatted = String(item.numero).padStart(2, "0");

            return (
              <div
                key={item.id}
                className={`
                  relative flex items-center justify-center py-3 rounded-xl text-xs sm:text-sm font-semibold select-none transition-all
                  ${
                    isMine
                      ? "bg-gradient-to-r from-mica-500 to-mica-600 text-white font-bold ring-2 ring-mica-400 ring-offset-2 shadow-xs scale-105 z-10"
                      : item.ocupado
                      ? "bg-rose-50/70 text-stone-400 border border-rose-100/60 line-through decoration-rose-300"
                      : "bg-white text-stone-700 border border-stone-100"
                  }
                `}
              >
                {formatted}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contacto directo y soporte */}
      <div className="p-5 rounded-2xl bg-white border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-stone-800">¿Tenés alguna consulta sobre tu compra?</h4>
          <p className="text-xs text-stone-500">Contactate de forma directa con el equipo de Adonai BY TIENDA MICA.</p>
        </div>
        <a
          href={`https://wa.me/5491123456789?text=${encodeURIComponent(
            `Hola! Compré números para la dinámica de ${sorteo.premio}. Mi compra es #${compra.id.slice(0, 8)}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Consultar por WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
