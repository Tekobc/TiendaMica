import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adonai BY TIENDA MICA — Dinámica Oficial",
  description: "Participá de la dinámica oficial de Adonai BY TIENDA MICA con números automáticos, premios exclusivos y compra directa desde la web.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen bg-[#faf8f5] text-[#2d2627] antialiased selection:bg-mica-200 selection:text-mica-900 flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
