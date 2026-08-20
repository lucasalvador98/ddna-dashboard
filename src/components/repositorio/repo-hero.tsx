import Link from 'next/link';
import { Bot } from 'lucide-react';

export function RepoHero() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-navy">Repositorio DDNA</h1>
        <p className="font-body text-gray-600 mt-2">
          Archivos propios de la Defensoría — Fuentes primarias, encuestas, informes
        </p>

        <Link
          href="/repositorio/chat"
          className="mt-6 flex items-center justify-between w-full max-w-2xl px-6 py-4 bg-gradient-to-r from-[#3777FF] to-[#334155] text-white rounded-2xl font-accent text-lg hover:shadow-xl hover:scale-[1.01] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-xl">Chat con la bibliografía</p>
              <p className="text-sm opacity-90">
                Consultá todos nuestros documentos como en NotebookLM
              </p>
            </div>
          </div>
          <svg
            className="w-6 h-6 group-hover:translate-x-2 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
