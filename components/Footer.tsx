import Link from "next/link";
import { Sparkles, Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-rose-100/80 bg-white/80 backdrop-blur-xs py-8 mt-16 text-stone-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-mica-100 flex items-center justify-center text-mica-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif tracking-widest text-xs font-semibold uppercase text-stone-800">
              ADONAI
            </span>
            <span className="text-[9px] tracking-wider text-sage-600 uppercase font-medium">
              BY TIENDA MICA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium text-stone-500">
          <Link href="/dinamica/bases-y-condiciones" className="hover:text-mica-600 transition-colors flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sage-600" />
            Bases y Condiciones
          </Link>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-mica-600 transition-colors"
          >
            Instagram
          </a>
        </div>

        <p className="text-[11px] text-stone-400 flex items-center gap-1">
          Hecho con <Heart className="w-3 h-3 text-mica-500 fill-mica-500 inline" /> para la comunidad
        </p>
      </div>
    </footer>
  );
}
