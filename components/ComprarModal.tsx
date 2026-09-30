"use client";

import { Sorteo } from "@/lib/types";
import { X, Sparkles } from "lucide-react";
import { FormularioCompra } from "@/components/FormularioCompra";

interface ComprarModalProps {
  sorteo: Sorteo;
  disponibles: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ComprarModal({ sorteo, disponibles, isOpen, onClose }: ComprarModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-100 flex flex-col relative my-8"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mica-600 mb-2">
          <Sparkles className="w-4 h-4 text-mica-500" />
          <span>Adquirir Números Oficiales</span>
        </div>

        <h3 className="text-xl font-serif font-bold text-stone-900 mb-1 leading-snug">
          {sorteo.premio}
        </h3>
        <p className="text-xs text-stone-500 mb-6">
          Completá tus datos para reservar y abonar por Mercado Pago.
        </p>

        {/* Formulario con avance dinámico e integración Mercado Pago */}
        <FormularioCompra
          sorteo={sorteo}
          disponibles={disponibles}
          onSuccess={() => {
            // Callback opcional
          }}
        />
      </div>
    </div>
  );
}
