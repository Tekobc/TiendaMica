import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#faf8f5]/90 border-b border-rose-100/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/sorteos" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-mica-500 to-mica-300 flex items-center justify-center text-white shadow-sm shadow-mica-200 transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-white/95" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif tracking-widest text-sm font-semibold uppercase text-mica-800">
              ADONAI
            </span>
            <span className="text-[10px] tracking-wider text-sage-600 -mt-0.5 font-medium">
              BY TIENDA MICA
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-stone-600">
          <Link
            href="/sorteos#tablero"
            className="hover:text-mica-600 transition-colors"
          >
            Tablero
          </Link>
          <Link
            href="/sorteos#historial"
            className="hover:text-mica-600 transition-colors"
          >
            Historial
          </Link>
          <Link
            href="/sorteos/bases-y-condiciones"
            className="hover:text-mica-600 text-stone-500 transition-colors hidden xs:inline-block"
          >
            Bases
          </Link>
        </nav>
      </div>
    </header>
  );
}
