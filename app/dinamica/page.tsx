import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SorteosHomeClient } from "@/components/SorteosHomeClient";
import { getActiveSorteo, getNumerosForSorteo } from "@/lib/mock-data";

export const revalidate = 0; // Datos dinámicos para disponibilidad en tiempo real

export default async function DinamicaPage() {
  const sorteo = await getActiveSorteo();

  if (!sorteo) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <section className="max-w-xl text-center">
            <h1 className="font-serif text-2xl font-bold text-stone-900">Próxima dinámica en preparación</h1>
            <p className="mt-3 text-sm text-stone-600">Todavía no hay una dinámica activa. Volvé pronto para conocer los detalles.</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const numeros = await getNumerosForSorteo(sorteo.id, sorteo.cantidad_numeros);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <SorteosHomeClient
          sorteo={sorteo}
          numeros={numeros}
        />
      </main>

      <Footer />
    </div>
  );
}
