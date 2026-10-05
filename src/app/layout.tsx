import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { AppShell } from '@/components/app-shell';

// Supabase and the authorization settings are resolved at runtime. This keeps
// production builds from prerendering administrative routes with missing local
// credentials, while preserving the existing SSR/API architecture.
export const dynamic = 'force-dynamic';

// Typography: the portal fallback stacks (Avenir Next / Arial Black) are defined
// as CSS variables in globals.css — Forma DJR is not licensed/hosted, so no
// remote font files are loaded here.
export const metadata: Metadata = {
  title: 'DDNA - Tablero de Monitoreo',
  description: 'Defensoría de los Derechos de Niñas, Niños y Adolescentes - Provincia de Córdoba',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-background">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
