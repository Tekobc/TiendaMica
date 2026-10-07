import { NumeroItem } from "@/lib/types";
import { Trophy } from "lucide-react";

interface NumerosGridProps {
  numeros: NumeroItem[];
  numeroGanador?: number | null;
}

export function NumerosGrid({ numeros, numeroGanador }: NumerosGridProps) {
  const disponibles = numeros.filter((n) => !n.ocupado).length;
  const ocupados = numeros.length - disponibles;

  return (
    <section id="tablero" className="w-full bg-white dark:bg-[#211c1f] rounded-3xl p-5 sm:p-7 shadow-xs border border-rose-100/70 dark:border-rose-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Tablero de Números
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-300 mt-0.5">
            Los números se asignan automáticamente y en orden correlativo al confirmar el pago.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          {numeroGanador && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-400 text-white shadow-2xs inline-flex items-center justify-center text-[9px] font-bold" aria-hidden="true">
                ★
              </span>
              <span className="text-amber-800 dark:text-amber-300 font-bold tabular-nums">Ganador (#{numeroGanador})</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-white dark:bg-[#282025] border border-rose-200/90 dark:border-rose-500/30 shadow-2xs inline-block" aria-hidden="true" />
            <span className="text-stone-600 dark:text-stone-300 font-medium tabular-nums">Disponible ({disponibles})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-100/90 dark:bg-[#2e2327] border border-rose-200 dark:border-rose-500/30 text-mica-700 dark:text-mica-300 inline-block" aria-hidden="true" />
            <span className="text-stone-600 dark:text-stone-300 font-medium tabular-nums">Ocupado ({ocupados})</span>
          </div>
        </div>
      </div>

      {/* Grid of numbers */}
      <div role="list" aria-label="Grilla de números de la dinámica" className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
        {numeros.map((item) => {
          const formattedNumber = String(item.numero).padStart(2, "0");
          const isWinner = numeroGanador === item.numero;
          const statusText = isWinner ? "Ganador" : item.ocupado ? "Ocupado" : "Disponible";

          return (
            <div
              key={item.id}
              role="listitem"
              aria-label={`Número ${formattedNumber}, estado: ${statusText}`}
              className={`
                relative flex items-center justify-center py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all select-none tabular-nums
                ${
                  isWinner
                    ? "bg-gradient-to-tr from-amber-400 to-amber-500 text-white font-bold ring-3 ring-amber-300 shadow-md scale-105 z-10 animate-pulse"
                    : item.ocupado
                    ? "bg-rose-50/70 dark:bg-[#2a2227] text-stone-400 dark:text-stone-500 border border-rose-100/60 dark:border-rose-900/40 line-through decoration-rose-300 dark:decoration-rose-500/50 cursor-not-allowed"
                    : "bg-white dark:bg-[#282025] text-stone-800 dark:text-stone-200 border border-rose-100 dark:border-rose-500/20 shadow-2xs hover:border-mica-300 dark:hover:border-mica-400 hover:text-mica-600 dark:hover:text-mica-300 hover:shadow-xs"
                }
              `}
              title={
                isWinner
                  ? `¡Número ${formattedNumber} GANADOR DE LA DINÁMICA!`
                  : item.ocupado
                  ? `Número ${formattedNumber}: Ocupado`
                  : `Número ${formattedNumber}: Disponible`
              }
            >
              {isWinner && <Trophy className="w-3 h-3 text-amber-100 mr-1 shrink-0" aria-hidden="true" />}
              {formattedNumber}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-rose-50 dark:border-rose-500/20 flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-300">
        <span>* Grilla actualizada en tiempo real</span>
        <span>Asignación automática y secuencial</span>
      </div>
    </section>
  );
}
