import Link from "next/link";
import { Facebook, Heart, Instagram, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-rose-100/80 bg-white/80 backdrop-blur-xs py-8 mt-16 text-stone-600 dark:border-rose-500/20 dark:bg-[#1d181b]/90 dark:text-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-adonai.svg"
            alt="Adonai BY TIENDA MICA"
            className="h-8 w-8 rounded-lg object-contain bg-white/80 p-1 ring-1 ring-rose-100/80 dark:bg-[#241d20] dark:ring-rose-500/20"
          />
          <div className="flex flex-col">
            <span className="font-serif tracking-widest text-xs font-semibold uppercase text-stone-800 dark:text-stone-100">
              ADONAI
            </span>
            <span className="text-[9px] tracking-wider text-sage-600 uppercase font-medium dark:text-sage-300">
              BY TIENDA MICA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs font-medium text-stone-500 dark:text-stone-300">
          <Link href="/dinamica/bases-y-condiciones" className="hover:text-mica-600 transition-colors flex items-center gap-1.5 dark:hover:text-mica-300">
            <Shield className="w-3.5 h-3.5 text-sage-600 dark:text-sage-300" />
            Bases y Condiciones
          </Link>
          <div className="flex items-center gap-2.5">
            <a
              href="https://www.instagram.com/tiendamica"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Adonai BY TIENDA MICA"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white/80 text-stone-700 transition-colors hover:text-mica-600 hover:border-mica-200 dark:border-rose-500/30 dark:bg-[#2a2227] dark:text-stone-100"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/tiendamica"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de Adonai BY TIENDA MICA"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white/80 text-stone-700 transition-colors hover:text-mica-600 hover:border-mica-200 dark:border-rose-500/30 dark:bg-[#2a2227] dark:text-stone-100"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <p className="text-[11px] text-stone-400 dark:text-stone-300 flex items-center gap-1">
          Hecho con <Heart className="w-3 h-3 text-mica-500 fill-mica-500 inline" /> para la comunidad
        </p>
      </div>
    </footer>
  );
}
