'use client';

import { Users, Heart, BookOpen, Coins, AlertTriangle, BarChart3, FileText, MapPin, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { SectionCard } from '@/components/section-card';

const tools = [
  {
    label: 'Monitoreo de Medios',
    href: '/monitoreo',
    icon: BarChart3,
    description: 'Seguimiento de notas periodísticas',
  },
  {
    label: 'Formularios',
    href: '/formularios',
    icon: FileText,
    description: 'Crear encuestas y formularios públicos',
  },
  {
    label: 'Mapa Geo',
    href: '/geo',
    icon: MapPin,
    description: 'Georreferenciación de indicadores',
  },
  {
    label: 'Chat Bibliografía',
    href: '/repositorio/chat',
    icon: MessageSquare,
    description: 'Consultá documentos con IA',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero — logo + title */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-10 lg:py-14 text-center">
          <img
            src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
            alt="DDNA"
            className="h-13 lg:h-15 mx-auto mb-5 object-contain"
          />
          <h1 className="font-display text-2xl lg:text-3xl text-slate-800 tracking-tight">
            Tablero de Monitoreo
          </h1>
          <p className="font-body text-sm lg:text-base text-slate-500 mt-2 max-w-xl mx-auto">
            Defensoría de los Derechos de Niñas, Niños y Adolescentes — Provincia de Córdoba
          </p>
          <div className="mt-5 mx-auto w-20 h-1 bg-gradient-to-r from-[#FF7F11] to-[#F3A712] rounded-full" />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 lg:py-12 space-y-12">
        {/* Section cards — Explorar por tema */}
        <section>
          <h2 className="font-display text-xl text-navy mb-5 text-center">Explorar por tema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SectionCard
              title="Salud"
              description="Mortalidad infantil, materna y neonatal"
              href="/salud"
              icon={Heart}
              color="terracotta"
            />
            <SectionCard
              title="Pobreza"
              description="Pobreza e indigencia por hogares y personas"
              href="/pobreza"
              icon={Users}
              color="magenta"
            />
            <SectionCard
              title="Educación"
              description="Asistencia, matrícula, unidades educativas"
              href="/educacion"
              icon={BookOpen}
              color="amber"
            />
            <SectionCard
              title="Seguridad"
              description="Casos de niñez, violencia familiar y justicia"
              href="/seguridad"
              icon={AlertTriangle}
              color="orange"
            />
            <SectionCard
              title="Inversión Social"
              description="Presupuesto provincial destinado a niñez"
              href="/inversion"
              icon={Coins}
              color="terracotta"
            />
            <SectionCard
              title="Repositorio"
              description="Documentos, informes y bibliografía DDNA"
              href="/repositorio"
              icon={BookOpen}
              color="navy"
            />
          </div>
        </section>

        {/* Tools — quick links */}
        <section>
          <h2 className="font-display text-xl text-navy mb-5 text-center">Herramientas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tools.map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-terracotta/40 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <tool.icon className="w-6 h-6 text-terracotta" />
                </div>
                <div className="text-center">
                  <p className="font-accent text-sm font-semibold text-slate-700">{tool.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logos/Cba.png"
                alt="Gobierno de Córdoba"
                width={32}
                height={32}
                className="rounded"
              />
              <img
                src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
                alt="DDNA"
                width={120}
                height={32}
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-400">
              Defensoría de los Derechos de Niñas, Niños y Adolescentes — Provincia de Córdoba
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
