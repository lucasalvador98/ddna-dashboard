'use client';

import { Users, Heart, BookOpen, Coins, AlertTriangle, BarChart3, FileText, MapPin, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionCard } from '@/components/section-card';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { dashboardPath } from '@/lib/app-path';

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
      {/* Hero — portada institucional (asset provisto por DDNA).
          El asset es un póster (logo, título y subtítulo horneados): se presenta como tal,
          en una tarjeta con esquinas y sombra sobre fondo blanco, para que el naranja
          quede contenido y compita en volumen con el resto del tablero. El texto real va
          sr-only (lectores de pantalla y SEO) y la imagen es decorativa (alt="").
          En mobile/tablet (la franja 5.3:1 dejaría el subtítulo ilegible y la columna de
          contenido es angosta) el recorte 8:3 encuadra el bloque del título; aspect fijo ⇒
          el encuadre no depende del ancho. Desde lg se ve el póster completo. */}
      <section>
        <h1 className="sr-only">Tablero de Monitoreo</h1>
        <p className="sr-only">
          Defensoría de los Derechos de Niñas, Niños y Adolescentes — Provincia de Córdoba
        </p>
        <div className="max-w-5xl mx-auto px-6 pt-6 lg:pt-10">
          <div className="relative aspect-[8/3] lg:aspect-[2506/473] rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5">
            <Image
              src={dashboardPath('/logos/portada-observatorio-web.jpg')}
              alt=""
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              preload
              className="object-cover object-[77%_50%] lg:object-center"
            />
          </div>
        </div>
      </section>

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
            {tools.map((tool, i) => (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 24 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href={tool.href} className="group block h-full">
                  <Card className="h-full border-gray-200 hover:border-terracotta/40 hover:shadow-md transition-colors">
                    <CardContent className="flex flex-col items-center gap-3 p-5">
                      <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <tool.icon className="w-6 h-6 text-terracotta" />
                      </div>
                      <div className="text-center">
                        <p className="font-accent text-sm font-semibold text-slate-700">{tool.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
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
                src={dashboardPath('/logos/Cba.png')}
                alt="Gobierno de Córdoba"
                width={32}
                height={32}
                className="rounded"
              />
              <img
                src={dashboardPath('/logos/LOGO DDNA_HORIZONTAL_COLOR.png')}
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
