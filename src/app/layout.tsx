import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  display: "swap",
});

const caprasimo = localFont({
  src: [
    {
      path: "../../src/fonts/Caprasimo-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-caprasimo",
  display: "swap",
  preload: true,
});

const dkLemonYellowSun = localFont({
  src: [
    {
      path: "../../src/fonts/DK Lemon Yellow Sun.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-dk-lemon",
  display: "swap",
  preload: true,
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
    <html lang="es" className={`${epilogue.variable} ${caprasimo.variable} ${dkLemonYellowSun.variable}`}>
      <body className="min-h-screen flex">
        <Sidebar />
        <div className="flex flex-col flex-1 min-h-screen">
          <Header />
          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
