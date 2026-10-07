interface ProgressBarProps {
  total: number;
  ocupados: number;
}

export function ProgressBar({ total, ocupados }: ProgressBarProps) {
  const disponibles = Math.max(0, total - ocupados);
  const porcentaje = total > 0 ? Math.min(100, Math.round((ocupados / total) * 100)) : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-mica-500 animate-pulse" aria-hidden="true" />
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            Faltan <strong className="text-mica-600 dark:text-mica-400 font-bold tabular-nums">{disponibles}</strong> números para la dinámica
          </span>
        </div>
        <div className="text-xs font-medium text-stone-500 dark:text-stone-300 flex items-center gap-3 tabular-nums">
          <span>{ocupados} vendidos</span>
          <span aria-hidden="true">•</span>
          <span className="text-mica-600 dark:text-mica-300 font-semibold">{porcentaje}% completado</span>
        </div>
      </div>

      {/* Progress track */}
      <div
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de venta de números"
        className="w-full bg-rose-50/80 dark:bg-[#2a2126] rounded-full h-3.5 p-0.5 overflow-hidden border border-rose-100/50 dark:border-rose-500/20"
      >
        <div
          className="bg-gradient-to-r from-mica-400 to-mica-500 h-full rounded-full transition-all duration-700 ease-out shadow-xs"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2.5 text-[11px] text-stone-400 dark:text-stone-300 font-medium tabular-nums">
        <span>0</span>
        <span>Meta: {total} números</span>
      </div>
    </div>
  );
}
