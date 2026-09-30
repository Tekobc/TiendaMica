import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MisNumerosClient } from "@/components/MisNumerosClient";
import { getParticipantData } from "@/lib/participante";

interface MisNumerosPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function MisNumerosPage({ params }: MisNumerosPageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  const data = await getParticipantData(token);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <MisNumerosClient
          compra={data.compra}
          sorteo={data.sorteo}
          misNumeros={data.misNumeros}
          todosLosNumeros={data.todosLosNumeros}
        />
      </main>

      <Footer />
    </div>
  );
}
