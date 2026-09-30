import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SorteosHomeClient } from "@/components/SorteosHomeClient";
import { getActiveSorteo, getNumerosForSorteo, getHistorialSorteos } from "@/lib/mock-data";

export const revalidate = 0; // Datos dinámicos para disponibilidad en tiempo real

export default async function SorteosPage() {
  const sorteo = await getActiveSorteo();
  const numeros = await getNumerosForSorteo(sorteo.id, sorteo.cantidad_numeros);
  const historial = await getHistorialSorteos();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <SorteosHomeClient
          sorteo={sorteo}
          numeros={numeros}
          historial={historial}
        />
      </main>

      <Footer />
    </div>
  );
}
