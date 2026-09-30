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
    <section id="tablero" className="w-full bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-rose-100/70">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
            Tablero de Números
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Los números se asignan automáticamente y en orden correlativo al confirmar el pago.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          {numeroGanador && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-400 text-white shadow-2xs inline-flex items-center justify-center text-[9px] font-bold">
                ★
              </span>
              <span className="text-amber-800 font-bold">Ganador (#{numeroGanador})</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-white border border-rose-200/90 shadow-2xs inline-block" />
            <span className="text-stone-600 font-medium">Disponible ({disponibles})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-100/90 border border-rose-200 text-mica-700 inline-block" />
            <span className="text-stone-600 font-medium">Ocupado ({ocupados})</span>
          </div>
        </div>
      </div>

      {/* Grid of numbers */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
        {numeros.map((item) => {
          const formattedNumber = String(item.numero).padStart(2, "0");
          const isWinner = numeroGanador === item.numero;

          return (
            <div
              key={item.id}
              className={`
                relative flex items-center justify-center py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all select-none
                ${
                  isWinner
                    ? "bg-gradient-to-tr from-amber-400 to-amber-500 text-white font-bold ring-3 ring-amber-300 shadow-md scale-105 z-10 animate-pulse"
                    : item.ocupado
                    ? "bg-rose-50/70 text-stone-400 border border-rose-100/60 line-through decoration-rose-300 cursor-not-allowed"
                    : "bg-white text-stone-800 border border-rose-100 shadow-2xs hover:border-mica-300 hover:text-mica-600 hover:shadow-xs"
                }
              `}
              title={
                isWinner
                  ? `¡Número ${formattedNumber} GANADOR DEL SORTEO!`
                  : item.ocupado
                  ? `Número ${formattedNumber}: Ocupado`
                  : `Número ${formattedNumber}: Disponible`
              }
            >
              {isWinner && <Trophy className="w-3 h-3 text-amber-100 mr-1 shrink-0" />}
              {formattedNumber}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-rose-50 flex items-center justify-between text-[11px] text-stone-400">
        <span>* Grilla actualizada en tiempo real</span>
        <span>Asignación automática y secuencial</span>
      </div>
    </section>
  );
}
