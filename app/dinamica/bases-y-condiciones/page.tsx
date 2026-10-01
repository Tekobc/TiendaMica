import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Calendar, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Bases y Condiciones — Adonai BY TIENDA MICA",
  description: "Términos, condiciones y bases legales de la dinámica de Adonai BY TIENDA MICA.",
};

export default function BasesYCondicionesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/dinamica"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-mica-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la dinámica</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-rose-100">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mica-600 mb-2">
            <FileText className="w-4 h-4" />
            <span>Documento Legal Oficial</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-3">
            Bases y Condiciones de la Dinámica
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mb-8 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sage-600" />
            <span>Última actualización: Septiembre 2026 • República Argentina</span>
          </p>

          <div className="space-y-6 text-sm text-stone-700 leading-relaxed font-sans">
            <section className="space-y-2">
              <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-mica-600" />
                1. Organizador
              </h2>
              <p>
                El presente evento es organizado y llevado adelante por <strong>Adonai BY TIENDA MICA</strong> (en adelante, el "Organizador"), emprendimiento dedicado a la comercialización de indumentaria, fragancias y accesorios femeninos, con domicilio operativo en la República Argentina.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-mica-600" />
                2. Requisitos de Participación y Mayoría de Edad
              </h2>
              <p>
                Podrán participar de la dinámica todas las personas humanas mayores de 18 (dieciocho) años con residencia legal dentro del territorio de la República Argentina que completen válidamente el proceso de adquisición de números y abonen el arancel correspondiente a través de los medios habilitados.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-mica-600" />
                3. Adquisición y Asignación de Números
              </h2>
              <p>
                Los números se asignan de manera automática y correlativa a través de la plataforma web oficial al confirmarse la acreditación del pago por parte de Mercado Pago. La compra se registra en estado pendiente y, solo cuando el pago queda aprobado, se asignan los números disponibles a la compra correspondiente.
              </p>
              <p className="text-xs text-stone-500 bg-rose-50/60 p-3 rounded-xl border border-rose-100/70">
                <strong>Importante:</strong> El participante recibe un enlace único y confidencial para consultar sus números asignados ("Mis Números"). No se revelan públicamente datos de contacto ni identidades en la grilla pública.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-mica-600" />
                4. Determinación del Ganador y Adjudicación
              </h2>
              <p>
                La dinámica se realizará una vez completada la venta de la totalidad de los números o al cumplirse la fecha límite estipulada para el evento. La modalidad de adjudicación será comunicada con antelación a través de las redes sociales del Organizador.
              </p>
              <p>
                El número ganador será cargado en el sistema de manera definitiva e inalterable, quedando registrado de forma transparente con fecha y hora.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-mica-600" />
                5. Entrega del Premio
              </h2>
              <p>
                El Organizador contactará a la persona acreedora del número ganador a través del teléfono de contacto suministrado al momento de la compra (vía WhatsApp o llamada). El premio no podrá ser canjeado por dinero en efectivo salvo que así lo estipule expresamente la descripción particular de la dinámica. Los gastos de envío o retiro se coordinarán directamente con la persona ganadora.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-mica-600" />
                6. Aceptación de las Bases
              </h2>
              <p>
                La sola participación en la dinámica implica el conocimiento y aceptación plena y sin reservas de todas y cada una de las cláusulas detalladas en el presente documento.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-sage-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              <span>Plataforma Oficial Adonai BY TIENDA MICA</span>
            </div>
            <Link
              href="/dinamica"
              className="text-xs font-semibold text-mica-600 hover:text-mica-700 hover:underline"
            >
              Ir a la Dinámica &rarr;
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
