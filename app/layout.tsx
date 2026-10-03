import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adonai BY TIENDA MICA — Dinámica Oficial",
  description: "Participá de la dinámica oficial de Adonai BY TIENDA MICA con números automáticos, premios exclusivos y compra directa desde la web.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

const themeScript = `(() => {
  try {
    const savedTheme = localStorage.getItem("adonai-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", savedTheme ? savedTheme === "dark" : prefersDark);
  } catch {}
})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-[var(--page-bg)] text-[var(--page-fg)] antialiased selection:bg-mica-200 selection:text-mica-900 flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
