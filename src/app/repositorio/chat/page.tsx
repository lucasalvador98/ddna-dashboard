"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Bot, User, FileText, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: {
    fileName: string;
    categoria?: string;
    chunkIndex?: number;
  }[];
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasContext, setHasContext] = useState<boolean | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");
    setHasContext(null);

    try {
      const response = await fetch("/api/repositorio/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setHasContext(data.hasContext);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-[#00074E] flex items-center gap-3">
          <Bot className="w-8 h-8 text-[#3777FF]" />
          Asistente DDNA
        </h1>
        <p className="font-body text-gray-600 mt-2">
          Hacé preguntas sobre la bibliografía de la Defensoría. El asistente buscará en los
          documentos disponibles y te responderá basándose en ellos.
        </p>
        {hasContext === false && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-accent text-sm text-amber-800">
                No hay documentos procesados
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Subí y procesá documentos en la sección{" "}
                <a href="/repositorio" className="underline hover:text-amber-900">
                  Repositorio
                </a>{" "}
                para que el asistente pueda responder preguntas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Messages */}
        <div className="h-[60vh] overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            /* Welcome State */
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#3777FF]/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-[#3777FF]" />
              </div>
              <h3 className="font-display text-xl text-[#00074E] mb-2">
                ¡Bienvenido al Asistente DDNA!
              </h3>
              <p className="font-body text-gray-600 max-w-md mb-6">
                Podés hacer preguntas sobre los documentos de la Defensoría. 
                El asistente buscará en la bibliografía disponible.
              </p>
              
              {/* Example Questions */}
              <div className="space-y-2 w-full max-w-md">
                <p className="text-sm text-gray-500 font-accent">Preguntas de ejemplo:</p>
                {[
                  "¿Cuál es la tasa de mortalidad infantil en Córdoba?",
                  "¿Qué datos hay sobre escolarización primaria?",
                  "¿Cómo se mide la pobreza infantil?",
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
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-[#3777FF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-[#3777FF]" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-[#00074E] text-white"
                      : "bg-gray-50 border border-gray-200"
                  } rounded-lg px-4 py-3`}
                >
                  <p className="font-body text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-accent text-gray-500 mb-2">Fuentes consultadas:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600"
                          >
                            <FileText className="w-3 h-3" />
                            {source.fileName}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-[#00074E] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-[#3777FF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[#3777FF]" />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-500">Buscando en documentos...</span>
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
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu pregunta sobre los documentos..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3777FF] focus:border-transparent outline-none font-body text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-[#00074E] text-white rounded-lg font-accent text-sm hover:bg-[#00063E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
          Este asistente utiliza RAG (Retrieval-Augmented Generation) para responder basándose en los documentos de la Defensoría.
          <a href="/repositorio" className="text-[#3777FF] hover:underline ml-1">
            Ver documentos disponibles →
          </a>
        </p>
      </div>
    </div>
  );
}
