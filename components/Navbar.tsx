import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--page-bg)]/90 border-b border-rose-100/80 shadow-xs dark:border-rose-500/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/dinamica"
          className="flex items-center gap-2.5 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-mica-400 rounded-xl p-1"
        >
          <img
            src="/logo-adonai.svg"
            alt="Adonai BY TIENDA MICA"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain bg-white/80 p-1 shadow-sm ring-1 ring-rose-100/80 transition-transform group-hover:scale-105 dark:bg-[#241d20] dark:ring-rose-500/20"
          />
          <div className="flex flex-col">
            <span className="font-serif tracking-widest text-sm font-semibold uppercase text-mica-800 dark:text-mica-200">
              ADONAI
            </span>
            <span className="text-[10px] tracking-wider text-sage-600 -mt-0.5 font-medium dark:text-sage-300">
              BY TIENDA MICA
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-200">
          <Link
            href="/dinamica"
            className="px-2.5 py-1.5 rounded-lg hover:text-mica-600 transition-colors dark:hover:text-mica-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-mica-400"
          >
            Inicio
          </Link>
          <Link
            href="/dinamica/bases-y-condiciones"
            className="px-2.5 py-1.5 rounded-lg hover:text-mica-600 text-stone-500 transition-colors hidden xs:inline-block dark:text-stone-300 dark:hover:text-mica-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-mica-400"
          >
            Bases
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
