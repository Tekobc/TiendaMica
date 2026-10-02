"use client";

import { Sorteo, NumeroItem } from "@/lib/types";
import { ProgressBar } from "@/components/ProgressBar";
import { NumerosGrid } from "@/components/NumerosGrid";
import { FormularioCompra } from "@/components/FormularioCompra";
import { Gift, ShieldCheck, Sparkles, AlertCircle, Trophy, Star } from "lucide-react";
import Link from "next/link";

interface SorteosHomeClientProps {
  sorteo: Sorteo;
  numeros: NumeroItem[];
}

export function SorteosHomeClient({ sorteo, numeros }: SorteosHomeClientProps) {
  const disponibles = numeros.filter((n) => !n.ocupado).length;
  const ocupados = numeros.length - disponibles;
  const isSorteado = sorteo.estado === "sorteado" && sorteo.numero_ganador !== null && sorteo.numero_ganador !== undefined;
  const isCompleto = sorteo.estado === "completo" || disponibles === 0;
  const titulo = sorteo.titulo || sorteo.premio;
  const descripcion = sorteo.descripcion || sorteo.descripcion_auto || "Participá comprando tu número";

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-8">
      {isSorteado && (
        <section className="w-full p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white shadow-lg shadow-amber-200/60 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Trophy className="w-8 h-8 text-white drop-shadow-xs" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-amber-100 block">
                ¡Dinámica Finalizada!
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Número Ganador: #{String(sorteo.numero_ganador).padStart(2, "0")}
              </h2>
            </div>
          </div>
          <div className="px-5 py-2.5 rounded-2xl bg-white text-amber-900 font-bold text-base shadow-xs shrink-0 flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>#{sorteo.numero_ganador}</span>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-rose-50/50 to-cream-100 rounded-3xl p-6 sm:p-8 shadow-xs border border-rose-100">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-100/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-sage-100/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-rose-200/60 shadow-2xs text-mica-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-mica-500" />
            <span>{isSorteado ? "Dinámica Finalizada" : "Dinámica Oficial Adonai"}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              {titulo}
            </h1>
            <p className="text-sm sm:text-base text-stone-600 font-medium">
              {descripcion}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="px-4 py-2 rounded-2xl bg-white border border-rose-100 shadow-2xs">
              <span className="text-[11px] text-stone-400 block font-medium">Premio</span>
              <span className="text-base sm:text-lg font-bold font-serif text-mica-700">
                {sorteo.premio}
              </span>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-white border border-rose-100 shadow-2xs">
              <span className="text-[11px] text-stone-400 block font-medium">Precio por número</span>
              <span className="text-xl sm:text-2xl font-bold font-serif text-stone-800">
                ${sorteo.precio_numero.toLocaleString("es-AR")}
              </span>
            </div>

            {isSorteado ? (
              <div className="ml-auto w-full sm:w-auto mt-2 sm:mt-0 py-3.5 px-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-sm flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Dinámica Finalizada</span>
              </div>
            ) : isCompleto ? (
              <div className="ml-auto w-full sm:w-auto mt-2 sm:mt-0 py-3.5 px-6 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 font-bold text-sm flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-500" />
                <span>Números Agotados</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-rose-100">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-stone-800">Compra tu número</h2>
          <span className="text-[11px] text-stone-500">Disponibles: {disponibles}</span>
        </div>
        <ProgressBar total={sorteo.cantidad_numeros} ocupados={ocupados} />
        <div className="mt-5">
          <FormularioCompra sorteo={sorteo} disponibles={disponibles} mostrarProgreso={false} />
        </div>
      </section>

      <NumerosGrid numeros={numeros} numeroGanador={sorteo.numero_ganador} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-rose-100/70 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-800">Asignación Transparente</h4>
            <p className="text-[11px] text-stone-500">Números consecutivos y automáticos al abonar</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-100/70 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-mica-600 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-800">Premios Exclusivos</h4>
            <p className="text-[11px] text-stone-500">Diseños y boxes seleccionadas de Adonai</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-100/70 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cream-100 text-stone-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-800">Bases y Condiciones</h4>
            <Link href="/dinamica/bases-y-condiciones" className="text-[11px] text-mica-600 hover:underline">
              Ver reglas y adjudicación &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
