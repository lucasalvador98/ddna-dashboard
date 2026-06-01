import type { Metadata } from "next";
import { Epilogue, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-accent",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DDNA - Tablero de Monitoreo",
  description: "Defensoría de los Derechos de Niñas, Niños y Adolescentes - Provincia de Córdoba",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${epilogue.variable} ${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#00074E] focus:text-white focus:rounded-lg">Saltar al contenido principal</a>
        <Sidebar />
        <div className="flex flex-col flex-1 min-h-screen">
          <Header />
          <main id="main-content" className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}