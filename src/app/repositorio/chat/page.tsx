'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, Bot, User, FileText, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { dashboardPath } from '@/lib/app-path';
import { AdminOnlyGate } from '@/components/admin-access-gate';
import { useAuth } from '@/components/auth-provider';
import { clearChatHistory, readChatHistory, safeSourceUrl, writeChatHistory, type ChatMessage } from '@/lib/chat-history';

interface RetrievalStatus {
  hasContext: boolean;
  searchMethod: string;
  warning?: string;
}

interface ChatTranscript {
  userId: string | null;
  messages: ChatMessage[];
  ready: boolean;
}

const EMPTY_CHAT_MESSAGES: ChatMessage[] = [];

function getSearchMethodLabel(method: string): string {
  switch (method) {
    case 'hybrid':
      return 'Híbrido';
    case 'vector':
      return 'Vectorial';
    case 'text':
      return 'Texto completo';
    case 'none':
      return 'No disponible';
    default:
      return method;
  }
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const activeUserIdRef = useRef<string | null>(null);
  const transcriptGenerationRef = useRef(0);
  const [transcript, setTranscript] = useState<ChatTranscript>({
    userId: null,
    messages: [],
    ready: false,
  });
  const historyReady = !authLoading && userId !== null && transcript.ready && transcript.userId === userId;
  const messages = historyReady ? transcript.messages : EMPTY_CHAT_MESSAGES;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retrievalStatus, setRetrievalStatus] = useState<RetrievalStatus | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<{ userId: string; content: string } | null>(null);
  const streamingContent = streamingMessage?.userId === userId ? streamingMessage.content : '';
  const [toolProgress, setToolProgress] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
const abortControllerRef = useRef<AbortController | null>(null);
const [retryQuestion, setRetryQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    const previousUserId = activeUserIdRef.current;
    if (previousUserId !== userId) {
      transcriptGenerationRef.current += 1;
      if (previousUserId) clearChatHistory(previousUserId);
    }
    activeUserIdRef.current = userId;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setTranscript({
        userId,
        messages: userId ? readChatHistory(userId) : [],
        ready: true,
      });
      setInput('');
      setLoading(false);
      setError('');
      setRetrievalStatus(null);
      setStreamingMessage(null);
      setToolProgress([]);
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, userId]);

  useEffect(() => {
    if (!historyReady || !userId) return;
    writeChatHistory(userId, transcript.messages);
  }, [historyReady, transcript.messages, userId]);

  const updateTranscriptMessages = useCallback(
    (ownerId: string, update: (messages: ChatMessage[]) => ChatMessage[]) => {
      setTranscript((previous) =>
        previous.ready && previous.userId === ownerId
          ? { ...previous, messages: update(previous.messages) }
          : previous,
      );
    },
    [],
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, toolProgress]);

  async function handleSSEResponse(
    response: Response,
    requestUserId: string,
    requestGeneration: number,
  ) {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';
    let content = '';
    let finalSources: NonNullable<ChatMessage['sources']> = [];
    let finalTools: string[] = [];
    let finalRetrievalStatus: RetrievalStatus | null = null;
    let completed = false;
    let receivedError = false;

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
              if (
                activeUserIdRef.current !== requestUserId ||
                transcriptGenerationRef.current !== requestGeneration
              ) continue;
              content += data.text;
              setStreamingMessage((previous) =>
                previous?.userId === requestUserId
                  ? { ...previous, content }
                  : previous,
              );
            } else if (currentEvent === 'tool') {
              if (
                activeUserIdRef.current !== requestUserId ||
                transcriptGenerationRef.current !== requestGeneration
              ) continue;
              if (data.status === 'start') {
                setToolProgress(prev => [...prev, data.label || 'Procesando información...']);
              } else if (data.status === 'end') {
                setToolProgress(prev => prev.slice(0, -1));
              }
            } else if (currentEvent === 'done') {
              completed = true;
              finalSources = data.sources || [];
              finalTools = data.toolsUsed || [];
              finalRetrievalStatus = {
                hasContext: typeof data.hasContext === 'boolean' ? data.hasContext : finalSources.length > 0,
                searchMethod: typeof data.searchMethod === 'string' ? data.searchMethod : 'none',
                warning: typeof data.warning === 'string' ? data.warning : undefined,
              };
            } else if (currentEvent === 'error') {
              receivedError = true;
              if (
                activeUserIdRef.current === requestUserId &&
                transcriptGenerationRef.current === requestGeneration
              ) {
                setError(data.error || 'Error desconocido');
              }
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    }

    if (
      activeUserIdRef.current !== requestUserId ||
      transcriptGenerationRef.current !== requestGeneration
    ) return;

    if (content && completed) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content,
        sources: finalSources,
        tools_used: finalTools,
        timestamp: new Date(),
      };
      updateTranscriptMessages(requestUserId, (previous) => [...previous, assistantMessage]);
    } else if (content && !receivedError) {
      setError('La respuesta se interrumpió antes de completarse.');
    }
    if (finalRetrievalStatus) setRetrievalStatus(finalRetrievalStatus);
    setStreamingMessage((previous) => previous?.userId === requestUserId ? null : previous);
  }

  async function handleJSONResponse(
    response: Response,
    requestUserId: string,
    requestGeneration: number,
  ) {
    const data = await response.json();
    if (
      activeUserIdRef.current !== requestUserId ||
      transcriptGenerationRef.current !== requestGeneration
    ) return;

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

    updateTranscriptMessages(requestUserId, (previous) => [...previous, assistantMessage]);
    setRetrievalStatus({
      hasContext: typeof data.hasContext === 'boolean' ? data.hasContext : Boolean(data.sources?.length),
      searchMethod: typeof data.searchMethod === 'string' ? data.searchMethod : 'none',
      warning: typeof data.warning === 'string' ? data.warning : undefined,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessageInternal(input);
  }

  async function sendMessageInternal(question: string) {
    if (!historyReady || !userId || !question.trim() || loading) return;
    const requestUserId = userId;
    const requestGeneration = transcriptGenerationRef.current;

    // Abort any in-flight request before starting a new one
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    updateTranscriptMessages(requestUserId, (previous) => [...previous, userMessage]);
    setInput('');
    setRetryQuestion(question);
    setLoading(true);
    setError('');
    setRetrievalStatus(null);
    setStreamingMessage({ userId: requestUserId, content: '' });
    setToolProgress([]);

    try {
      const response = await fetch(dashboardPath('/api/repositorio/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('text/event-stream')) {
        await handleSSEResponse(response, requestUserId, requestGeneration);
      } else {
        await handleJSONResponse(response, requestUserId, requestGeneration);
      }
    } catch (err) {
      if (
        activeUserIdRef.current !== requestUserId ||
        transcriptGenerationRef.current !== requestGeneration
      )
        return;
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('');
        return;
      }
      setError(String(err));
    } finally {
      if (
        activeUserIdRef.current === requestUserId &&
        transcriptGenerationRef.current === requestGeneration
      ) {
        setLoading(false);
        setToolProgress([]);
        setStreamingMessage((previous) => previous?.userId === requestUserId ? null : previous);
        if (abortControllerRef.current === controller) abortControllerRef.current = null;
      }
    }
  }

  const handleCancel = useCallback(() => {
    if (!abortControllerRef.current) return;
    abortControllerRef.current.abort();
    setLoading(false);
    setError('');
    setStreamingMessage(null);
    setToolProgress([]);
    abortControllerRef.current = null;
  }, []);

  const handleRetry = useCallback(() => {
    if (!retryQuestion || loading) return;
    setError('');
    sendMessageInternal(retryQuestion);
  }, [retryQuestion, loading]);

  const handleNewConversation = useCallback(() => {
    if (!historyReady || !userId || loading) return;
    transcriptGenerationRef.current += 1;
    clearChatHistory(userId);
    setTranscript((previous) =>
      previous.userId === userId ? { ...previous, messages: [] } : previous,
    );
    setInput('');
    setRetryQuestion(null);
    setError('');
    setRetrievalStatus(null);
    setStreamingMessage((previous) => previous?.userId === userId ? null : previous);
    setToolProgress([]);
    setLoading(false);
  }, [historyReady, loading, userId]);

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  return (
    <AdminOnlyGate feature="el asistente de investigación">
    {historyReady ? (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-navy flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue" />
            Asistente de Investigación DDNA
          </h1>
          <p className="font-body text-gray-600 mt-2">
            Hacé preguntas sobre la Defensoría. El asistente buscará en los documentos disponibles
            y, si es necesario, complementará con información de la web.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleNewConversation}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
          >
            + Nueva conversación
          </button>
        )}
      </div>

      {retrievalStatus && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3" role="status">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-accent text-sm text-amber-800">
              {retrievalStatus.warning
                ? retrievalStatus.hasContext
                  ? 'Se encontraron documentos relacionados, pero la búsqueda generó una advertencia.'
                  : 'La búsqueda generó una advertencia y no encontró documentos relacionados.'
                : retrievalStatus.hasContext
                  ? 'Se encontraron documentos relacionados.'
                  : 'La búsqueda no encontró documentos relacionados.'}
            </p>
            {retrievalStatus.warning && (
              <p className="text-sm text-amber-700 mt-1">{retrievalStatus.warning}</p>
            )}
            <p className="text-sm text-amber-700 mt-1">
              Método de búsqueda: {getSearchMethodLabel(retrievalStatus.searchMethod)}
            </p>
            {!retrievalStatus.warning && !retrievalStatus.hasContext && (
              <p className="text-sm text-amber-700 mt-1">
                Puede intentar otra consulta o revisar los documentos disponibles en{' '}
                <Link href="/repositorio" className="underline hover:text-amber-900">Repositorio</Link>.
              </p>
            )}
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
              <div className="w-16 h-16 bg-blue/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-blue" />
              </div>
              <h3 className="font-display text-xl text-navy mb-2">
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
                  <div className="w-8 h-8 bg-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-navy text-white'
                      : 'bg-gray-50 border border-gray-200'
                  } rounded-lg px-4 py-3`}
                >
                  <p className="font-body text-sm whitespace-pre-wrap">{msg.content}</p>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-accent text-gray-500 mb-2">Fuentes:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source: NonNullable<ChatMessage['sources']>[number], sIdx: number) => {
                          const name = source.fileName || 'Documento';
                          const clean = name.length > 30 ? name.substring(0, 27) + '...' : name;
                          const href = safeSourceUrl(source.downloadUrl);
                          return (
                            href ? (
                              <a
                                key={sIdx}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue/10 text-blue rounded text-xs font-medium hover:bg-blue/20 hover:underline"
                                title={name}
                              >
                                <FileText className="w-3 h-3" />
                                {clean}
                              </a>
                            ) : (
                              <span
                                key={sIdx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue/10 text-blue rounded text-xs font-medium"
                                title={name}
                              >
                                <FileText className="w-3 h-3" />
                                {clean}
                              </span>
                            )
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Streaming message */}
          {streamingContent && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue" />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 max-w-[80%]">
                <p className="font-body text-sm whitespace-pre-wrap">{streamingContent}</p>
                <span className="inline-block w-1.5 h-4 bg-blue animate-pulse ml-0.5 align-text-bottom" />
              </div>
            </div>
          )}

          {/* Loading / Tool progress indicator */}
          {loading && !streamingContent && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue" />
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
              <button
                onClick={handleRetry}
                disabled={loading}
                className="ml-auto px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reintentar
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              aria-label="Escribí tu pregunta"
              placeholder="Escribí tu pregunta sobre los documentos..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent outline-none font-body text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-navy text-white rounded-lg font-accent text-sm hover:bg-[#050506] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar
            </button>
            {loading && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Info Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 font-body">
          Este asistente usa Agent con Tools — busca en tus documentos y complementa con búsqueda
          web cuando es necesario.
          <a href={dashboardPath('/repositorio')} className="text-blue hover:underline ml-1">
            Ver documentos disponibles →
          </a>
        </p>
      </div>
    </div>
    ) : (
      <div role="status" className="flex justify-center py-16 text-sm text-gray-500">
        Restaurando la conversación...
      </div>
    )}
    </AdminOnlyGate>
  );
}
