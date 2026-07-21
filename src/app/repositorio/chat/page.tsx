'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, Bot, User, FileText, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    fileName: string;
    categoria?: string;
    chunkIndex?: number;
    similarity?: number;
  }[];
  tools_used?: string[];
  timestamp: Date;
}

const TOOL_LABELS: Record<string, string> = {
  search_knowledge_base: 'Buscando documentos...',
  listAllDocuments: 'Listando documentos...',
  search_web: 'Buscando en la web...',
  scrape_url: 'Extrayendo contenido web...',
};

function getToolLabel(tool: string): string {
  return TOOL_LABELS[tool] || 'Procesando información...';
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasContext, setHasContext] = useState<boolean | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [toolProgress, setToolProgress] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, toolProgress]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');
    setHasContext(null);
    setStreamingContent('');
    setToolProgress([]);

    try {
      const response = await fetch('/api/repositorio/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('text/event-stream')) {
        await handleSSEResponse(response);
      } else {
        await handleJSONResponse(response);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
      setToolProgress([]);
    }
  }, [input, loading, messages]);

  async function handleSSEResponse(response: Response) {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';
    let content = '';
    let finalSources: NonNullable<ChatMessage['sources']> = [];
    let finalTools: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('event: ')) {
          currentEvent = trimmed.slice(7).trim();
        } else if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          try {
            const data = JSON.parse(dataStr);

            if (currentEvent === 'token') {
              content += data.text;
              setStreamingContent(content);
            } else if (currentEvent === 'tool') {
              if (data.status === 'start') {
                setToolProgress(prev => [...prev, data.label || getToolLabel(data.tool)]);
              } else if (data.status === 'end') {
                setToolProgress(prev => prev.slice(0, -1));
              }
            } else if (currentEvent === 'done') {
              finalSources = data.sources || [];
              finalTools = data.toolsUsed || [];
            } else if (currentEvent === 'error') {
              setError(data.error || 'Error desconocido');
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    }

    if (content) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content,
        sources: finalSources,
        tools_used: finalTools,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setHasContext(finalSources.length > 0);
    }
    setStreamingContent('');
  }

  async function handleJSONResponse(response: Response) {
    const data = await response.json();

    if (data.error) {
      setError(data.error);
      return;
    }

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: data.answer,
      sources: data.sources,
      tools_used: data.tools_used,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setHasContext(data.sources && data.sources.length > 0);
  }

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#1a2556] flex items-center gap-3">
            <Bot className="w-8 h-8 text-[#3777FF]" />
            Asistente de Investigación DDNA
          </h1>
          <p className="font-body text-gray-600 mt-2">
            Hacé preguntas sobre la Defensoría. El asistente buscará en los documentos disponibles
            y, si es necesario, complementará con información de la web.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
          >
            + Nueva conversación
          </button>
        )}
      </div>

      {hasContext === false && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-accent text-sm text-amber-800">No hay documentos procesados</p>
            <p className="text-sm text-amber-700 mt-1">
              Subí y procesá documentos en la sección{' '}
              <Link href="/repositorio" className="underline hover:text-amber-900">
                Repositorio
              </Link>{' '}
              para que el asistente pueda responder preguntas.
            </p>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Messages */}
        <div className="h-[60vh] overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !streamingContent ? (
            /* Welcome State */
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#3777FF]/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-[#3777FF]" />
              </div>
              <h3 className="font-display text-xl text-[#1a2556] mb-2">
                ¡Bienvenido al Asistente DDNA!
              </h3>
              <p className="font-body text-gray-600 max-w-md mb-6">
                Preguntá sobre indicadores sociales, documentos de la Defensoría o pedí informes. El
                asistente combina datos estadísticos con la bibliografía disponible.
              </p>

              {/* Example Questions */}
              <div className="space-y-2 w-full max-w-md">
                <p className="text-sm text-gray-500 font-accent">Preguntas de ejemplo:</p>
                {[
                  '¿Cuál es la tasa de mortalidad infantil en Córdoba?',
                  '¿Qué dice la encuesta de 2024 sobre consumo de sustancias?',
                  '¿Cuáles son los últimos datos de pobreza infantil en Argentina?',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(q)}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-[#3777FF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-[#3777FF]" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-[#1a2556] text-white'
                      : 'bg-gray-50 border border-gray-200'
                  } rounded-lg px-4 py-3`}
                >
                  <p className="font-body text-sm whitespace-pre-wrap">{msg.content}</p>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-accent text-gray-500 mb-2">Fuentes:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source: any, sIdx: number) => {
                          const name = source.fileName || source.source || 'Documento';
                          const clean = name.length > 30 ? name.substring(0, 27) + '...' : name;
                          return (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-[#3777FF]/10 text-[#3777FF] rounded text-xs font-medium"
                              title={name}
                            >
                              <FileText className="w-3 h-3" />
                              {clean}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-[#1a2556] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Streaming message */}
          {streamingContent && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[#3777FF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[#3777FF]" />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 max-w-[80%]">
                <p className="font-body text-sm whitespace-pre-wrap">{streamingContent}</p>
                <span className="inline-block w-1.5 h-4 bg-[#3777FF] animate-pulse ml-0.5 align-text-bottom" />
              </div>
            </div>
          )}

          {/* Loading / Tool progress indicator */}
          {loading && !streamingContent && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[#3777FF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[#3777FF]" />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                {toolProgress.length > 0 ? (
                  <div className="space-y-1">
                    {toolProgress.map((label, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500">Analizando y buscando información...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              aria-label="Escribí tu pregunta"
              placeholder="Escribí tu pregunta sobre los documentos..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3777FF] focus:border-transparent outline-none font-body text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-[#1a2556] text-white rounded-lg font-accent text-sm hover:bg-[#00063E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar
            </button>
          </div>
        </form>
      </div>

      {/* Info Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 font-body">
          Este asistente usa Agent con Tools — busca en tus documentos y complementa con búsqueda
          web cuando es necesario.
          <a href="/repositorio" className="text-[#3777FF] hover:underline ml-1">
            Ver documentos disponibles →
          </a>
        </p>
      </div>
    </div>
  );
}
