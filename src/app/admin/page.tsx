"use client";

import { useState, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle, Database, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { CategoriaIndicador } from "@/lib/supabase";

interface IndicadorOption {
  id: string;
  nombre: string;
  categoria: string;
}

interface ParsedRow {
  valor: number;
  periodo: string;
  region: string;
  desglose: Record<string, string> | null;
}

type UploadStatus = "idle" | "parsing" | "preview" | "uploading" | "success" | "error";

export default function AdminPage() {
  const [indicadores, setIndicadores] = useState<IndicadorOption[]>([]);
  const [selectedIndicador, setSelectedIndicador] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [rawCsv, setRawCsv] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [insertedCount, setInsertedCount] = useState(0);
  const [loadingIndicadores, setLoadingIndicadores] = useState(false);

  // Load indicadores from Supabase
  const loadIndicadores = useCallback(async () => {
    setLoadingIndicadores(true);
    try {
      const { data, error } = await supabase
        .from("indicadores")
        .select("id, nombre, categoria")
        .eq("activo", true)
        .order("categoria, nombre");

      if (error) {
        setMessage(`Error cargando indicadores: ${error.message}`);
        return;
      }
      setIndicadores((data as IndicadorOption[]) ?? []);
    } catch {
      setMessage("Error de conexión a Supabase.");
    } finally {
      setLoadingIndicadores(false);
    }
  }, []);

  // Parse CSV text into rows
  const parseCsv = useCallback((csv: string): ParsedRow[] => {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < 3) continue;

      const getValue = (header: string): string => {
        const idx = headers.indexOf(header);
        return idx >= 0 ? values[idx] ?? "" : "";
      };

      const valor = parseFloat(getValue("valor"));
      const periodo = getValue("periodo");
      const region = getValue("region") || "Córdoba";

      if (isNaN(valor) || !periodo) continue;

      // Parse desglose from remaining columns
      const desgloseHeaders = headers.filter(
        (h) => !["valor", "periodo", "region"].includes(h)
      );
      const desglose: Record<string, string> = {};
      for (const dh of desgloseHeaders) {
        const val = getValue(dh);
        if (val) desglose[dh] = val;
      }

      rows.push({
        valor,
        periodo,
        region,
        desglose: Object.keys(desglose).length > 0 ? desglose : null,
      });
    }

    return rows;
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setRawCsv(text);
        setStatus("parsing");

        const rows = parseCsv(text);
        if (rows.length === 0) {
          setStatus("error");
          setMessage("No se pudieron parsear datos del CSV. Verifique el formato.");
          return;
        }

        setParsedRows(rows);
        setStatus("preview");
        setMessage(`Se encontraron ${rows.length} filas de datos.`);
      };
      reader.readAsText(file);
    },
    [parseCsv]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedIndicador || parsedRows.length === 0) return;

    setStatus("uploading");
    setMessage("Subiendo datos...");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indicador_id: selectedIndicador,
          rows: parsedRows,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(result.error || "Error desconocido al subir datos.");
        return;
      }

      setStatus("success");
      setInsertedCount(result.inserted ?? 0);
      setMessage(
        `✓ ${result.inserted} registros insertados en "${result.indicador}". ${result.skipped > 0 ? `${result.skipped} filas omitidas.` : ""}`
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error de conexión.");
    }
  }, [selectedIndicador, parsedRows]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ddna-background)" }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--ddna-navy)" }} />
          </Link>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--ddna-navy)" }}
            >
              Administración de Datos
            </h1>
            <p className="text-sm" style={{ color: "var(--ddna-navy)", opacity: 0.7 }}>
              Cargue datos CSV a los indicadores del tablero
            </p>
          </div>
        </div>

        {/* Status message */}
        {message && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{
              backgroundColor:
                status === "success"
                  ? "rgba(34, 197, 94, 0.1)"
                  : status === "error"
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(243, 167, 18, 0.1)",
              border: `1px solid ${status === "success" ? "#22c55e" : status === "error" ? "#ef4444" : "#F3A712"}`,
            }}
          >
            {status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
            {status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
            <span className="text-sm font-medium" style={{ color: "var(--ddna-navy)" }}>
              {message}
            </span>
          </div>
        )}

        {/* Step 1: Select indicator */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5" style={{ color: "var(--ddna-amber)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--ddna-navy)" }}>
              1. Seleccionar Indicador
            </h2>
          </div>

          {indicadores.length === 0 && (
            <button
              onClick={loadIndicadores}
              disabled={loadingIndicadores}
              className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
              style={{
                backgroundColor: "var(--ddna-amber)",
                opacity: loadingIndicadores ? 0.6 : 1,
              }}
            >
              {loadingIndicadores ? "Cargando..." : "Cargar indicadores"}
            </button>
          )}

          {indicadores.length > 0 && (
            <select
              value={selectedIndicador}
              onChange={(e) => setSelectedIndicador(e.target.value)}
              className="w-full p-3 rounded-lg border text-sm"
              style={{ borderColor: "var(--ddna-border, #E0E0E0)" }}
            >
              <option value="">— Seleccione un indicador —</option>
              {Object.entries(
                indicadores.reduce<Record<string, IndicadorOption[]>>((acc, ind) => {
                  if (!acc[ind.categoria]) acc[ind.categoria] = [];
                  acc[ind.categoria].push(ind);
                  return acc;
                }, {})
              ).map(([cat, items]) => (
                <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                  {items.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}

          {selectedIndicador && (
            <p className="mt-2 text-xs" style={{ color: "var(--ddna-navy)", opacity: 0.6 }}>
              ID: {selectedIndicador}
            </p>
          )}
        </div>

        {/* Step 2: Upload CSV */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-5 h-5" style={{ color: "var(--ddna-magenta)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--ddna-navy)" }}>
              2. Cargar Archivo CSV
            </h2>
          </div>

          <p className="text-sm mb-4" style={{ color: "var(--ddna-navy)", opacity: 0.7 }}>
            El CSV debe tener columnas: <code className="bg-gray-100 px-1 rounded">periodo</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">valor</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">region</code> (opcional, default: Córdoba).
            Columnas adicionales se interpretarán como desglose JSON.
          </p>

          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
            style={{ borderColor: "var(--ddna-border, #E0E0E0)" }}
            onClick={() => document.getElementById("csv-upload")?.click()}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#F3A712")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ddna-border, #E0E0E0)")}
          >
            <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--ddna-navy)", opacity: 0.4 }} />
            <p className="text-sm" style={{ color: "var(--ddna-navy)", opacity: 0.6 }}>
              Haga clic para seleccionar un archivo CSV
            </p>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Or paste CSV directly */}
          <details className="mt-4">
            <summary className="text-sm cursor-pointer" style={{ color: "var(--ddna-amber)" }}>
              O pegue el contenido CSV directamente
            </summary>
            <textarea
              value={rawCsv}
              onChange={(e) => {
                setRawCsv(e.target.value);
                if (e.target.value.trim()) {
                  const rows = parseCsv(e.target.value);
                  if (rows.length > 0) {
                    setParsedRows(rows);
                    setStatus("preview");
                    setMessage(`${rows.length} filas detectadas.`);
                  }
                }
              }}
              placeholder="periodo,valor,region,desglose_key&#10;2024,6.8,Córdoba&#10;2023,7.1,Córdoba"
              className="w-full mt-2 p-3 rounded-lg border text-xs font-mono"
              style={{ borderColor: "var(--ddna-border, #E0E0E0)" }}
              rows={6}
            />
          </details>
        </div>

        {/* Step 3: Preview & Upload */}
        {parsedRows.length > 0 && status === "preview" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5" style={{ color: "var(--ddna-amber)" }} />
              <h2 className="text-lg font-semibold" style={{ color: "var(--ddna-navy)" }}>
                3. Revisar y Subir ({parsedRows.length} filas)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--ddna-border, #E0E0E0)" }}>
                    <th className="p-2 text-left font-medium" style={{ color: "var(--ddna-navy)" }}>Periodo</th>
                    <th className="p-2 text-right font-medium" style={{ color: "var(--ddna-navy)" }}>Valor</th>
                    <th className="p-2 text-left font-medium" style={{ color: "var(--ddna-navy)" }}>Región</th>
                    <th className="p-2 text-left font-medium" style={{ color: "var(--ddna-navy)" }}>Desglose</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: "var(--ddna-border, #E0E0E0)" }}>
                      <td className="p-2">{row.periodo}</td>
                      <td className="p-2 text-right">{row.valor}</td>
                      <td className="p-2">{row.region}</td>
                      <td className="p-2">
                        {row.desglose
                          ? Object.entries(row.desglose)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  {parsedRows.length > 10 && (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-xs opacity-60">
                        ... y {parsedRows.length - 10} filas más
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handleUpload}
                disabled={!selectedIndicador}
              className="px-6 py-3 rounded-lg text-white font-medium transition-colors"
              style={{
                backgroundColor: selectedIndicador ? "var(--ddna-amber)" : "#ccc",
                cursor: selectedIndicador ? "pointer" : "not-allowed",
              }}
              >
                Subir a Supabase
              </button>
              {!selectedIndicador && (
                <p className="text-xs" style={{ color: "var(--ddna-magenta)" }}>
                  Seleccione un indicador primero
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success result */}
        {status === "success" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-semibold" style={{ color: "var(--ddna-navy)" }}>
              {insertedCount} registros subidos exitosamente
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                setParsedRows([]);
                setRawCsv("");
                setSelectedIndicador("");
                setMessage("");
              }}
              className="mt-4 px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: "var(--ddna-amber)" }}
            >
              Subir otro archivo
            </button>
          </div>
        )}

        {/* Format reference */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ddna-navy)" }}>
            Formato del CSV
          </h3>
          <pre
            className="text-xs p-4 rounded-lg overflow-x-auto"
            style={{ backgroundColor: "var(--ddna-background)" }}
          >
{`periodo,valor,region
2024,6.8,Córdoba
2023,7.1,Córdoba

# Con desglose:
periodo,valor,region,vacuna
2023,94.2,Córdoba,BCG
2023,91.8,Córdoba,Polio`}
          </pre>
        </div>
      </div>
    </div>
  );
}