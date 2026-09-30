import { SorteoHistorialItem } from "@/lib/types";
import { Trophy, Calendar, Sparkles } from "lucide-react";

interface HistorialSorteosProps {
  historial: SorteoHistorialItem[];
}

export function HistorialSorteos({ historial }: HistorialSorteosProps) {
  if (historial.length === 0) {
    return null;
  }

  return (
    <section id="historial" className="w-full bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-rose-100/70">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
          Historial de Sorteos Anteriores
        </h2>
      </div>
      <p className="text-xs text-stone-500 mb-5">
        Transparencia y ganadores de ediciones anteriores de Adonai BY TIENDA MICA.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {historial.map((sorteo) => {
          const fecha = new Date(sorteo.ganador_cargado_at).toLocaleDateString("es-AR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={sorteo.id}
              className="p-4 rounded-2xl bg-gradient-to-br from-cream-50 to-rose-50/40 border border-rose-100/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-sage-600" />
                    {fecha}
                  </span>
                  <span className="text-[11px] bg-sage-100/80 text-sage-700 px-2 py-0.5 rounded-full font-medium">
                    Finalizado
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-stone-800 line-clamp-2">
                  {sorteo.premio}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-rose-100/60 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">Número ganador:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mica-100 text-mica-700 font-bold text-sm border border-mica-200 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-mica-600" />
                  #{String(sorteo.numero_ganador).padStart(2, "0")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
