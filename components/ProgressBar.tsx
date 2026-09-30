interface ProgressBarProps {
  total: number;
  ocupados: number;
}

export function ProgressBar({ total, ocupados }: ProgressBarProps) {
  const disponibles = Math.max(0, total - ocupados);
  const porcentaje = total > 0 ? Math.min(100, Math.round((ocupados / total) * 100)) : 0;

  return (
    <div className="w-full bg-white rounded-2xl p-5 shadow-xs border border-rose-100/70">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-mica-500 animate-pulse" />
          <span className="text-sm font-semibold text-stone-800">
            Faltan <strong className="text-mica-600 font-bold">{disponibles}</strong> números para el sorteo
          </span>
        </div>
        <div className="text-xs font-medium text-stone-500 flex items-center gap-3">
          <span>{ocupados} vendidos</span>
          <span>•</span>
          <span className="text-mica-600 font-semibold">{porcentaje}% completado</span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full bg-rose-50/80 rounded-full h-3.5 p-0.5 overflow-hidden border border-rose-100/50">
        <div
          className="bg-gradient-to-r from-mica-400 to-mica-500 h-full rounded-full transition-all duration-700 ease-out shadow-xs"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2.5 text-[11px] text-stone-400 font-medium">
        <span>0</span>
        <span>Meta: {total} números</span>
      </div>
    </div>
  );
}
