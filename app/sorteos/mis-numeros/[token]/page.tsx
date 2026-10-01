import { permanentRedirect } from "next/navigation";

interface MisNumerosPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function MisNumerosPage({ params }: MisNumerosPageProps) {
  const { token } = await params;
  permanentRedirect(`/dinamica/mis-numeros/${token}`);
}
