"use client";

import { useEffect, useState } from "react";
import { FileText, FileSpreadsheet, File, FolderOpen, Search, Upload, X, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RepoFile {
  id: string;
  nombre_archivo: string;
  descripcion: string;
  categoria: string;
  tipo_documento: string;
  tamano_bytes: number | null;
  url_storage: string | null;
  fecha_subida: string;
  notas: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  encuestas: { bg: "bg-blue-100", text: "text-blue-700" },
  inversion: { bg: "bg-orange-100", text: "text-orange-700" },
  proteccion: { bg: "bg-red-100", text: "text-red-700" },
  consumos: { bg: "bg-purple-100", text: "text-purple-700" },
  medios: { bg: "bg-gray-100", text: "text-gray-700" },
  informes: { bg: "bg-green-100", text: "text-green-700" },
};

export default function RepositorioPage() {
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("informes");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadNotas, setUploadNotas] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  useEffect(() => {
    fetchRepo();
  }, []);

  const fetchRepo = async () => {
    const { data, error } = await supabase
      .from("repositorio")
      .select("*")
      .order("categoria", { ascending: true })
      .order("nombre_archivo", { ascending: true });

    if (!error) setFiles(data || []);
    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadError("");
    setUploadSuccess("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoria", uploadCategory);
    formData.append("descripcion", uploadDesc);
    formData.append("notas", uploadNotas);

    try {
      const res = await fetch("/api/repositorio/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setUploadError(data.error);
      } else {
        setUploadSuccess("Archivo subido exitosamente!");
        setSelectedFile(null);
        setUploadDesc("");
        setUploadNotas("");
        fetchRepo(); // Refresh list
      }
    } catch (err) {
      setUploadError(String(err));
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      !filter ||
      f.nombre_archivo.toLowerCase().includes(filter.toLowerCase()) ||
      f.descripcion?.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = category === "all" || f.categoria === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(files.map((f) => f.categoria))];
  const stats = {
    total: files.length,
    pdf: files.filter((f) => f.tipo_documento === "pdf").length,
    xlsx: files.filter((f) => f.tipo_documento === "xlsx").length,
    docx: files.filter((f) => f.tipo_documento === "docx").length,
  };

  const getFileIcon = (tipo: string) => {
    if (tipo === "pdf") return <FileText className="w-5 h-5" />;
    if (tipo === "xlsx") return <FileSpreadsheet className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="font-display text-3xl text-[#00074E]">Repositorio DDNA</h1>
          <p className="font-body text-gray-600 mt-2">
            Archivos propios de la Defensoría — Fuentes primarias, encuestas, informes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-2xl font-display text-[#00074E]">{stats.total}</p>
            <p className="text-sm text-gray-500">Total archivos</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-2xl font-display text-[#00074E]">{stats.pdf}</p>
            <p className="text-sm text-gray-500">PDF</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-2xl font-display text-[#00074E]">{stats.xlsx}</p>
            <p className="text-sm text-gray-500">Excel</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-2xl font-display text-[#00074E]">{stats.docx}</p>
            <p className="text-sm text-gray-500">Word</p>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-accent text-lg text-[#00074E] mb-4">Subir nuevo archivo</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Categoría</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="encuestas">Encuestas</option>
                <option value="inversion">Inversión</option>
                <option value="consumos">Consumos</option>
                <option value="medios">Medios</option>
                <option value="proteccion">Protección</option>
                <option value="informes">Informes</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-1">Descripción</label>
              <input
                type="text"
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                placeholder="Descripción del archivo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-1">Notas</label>
              <input
                type="text"
                value={uploadNotas}
                onChange={(e) => setUploadNotas(e.target.value)}
                placeholder="Notas adicionales"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-[#00074E] text-white rounded-lg font-accent text-sm cursor-pointer hover:bg-[#00063E]">
              {uploading ? "Subiendo..." : <Upload className="w-4 h-4" />}
              {uploading ? "Subiendo..." : "Seleccionar archivo"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.xlsx,.xls,.docx,.doc"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          </div>
          {uploadError && (
            <p className="text-red-600 mt-2 text-sm">{uploadError}</p>
          )}
          {uploadSuccess && (
            <p className="text-green-600 mt-2 text-sm flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {uploadSuccess}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00074E] focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-lg font-accent text-sm transition-colors ${
                  category === cat ? "bg-[#00074E] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat === "all" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Files table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00074E]" />
            <span className="ml-3 text-gray-500">Cargando...</span>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">Archivo</th>
                  <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">Categoría</th>
                  <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">Tipo</th>
                  <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">Descripción</th>
                  <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFiles.map((file) => {
                  const catStyle = categoryColors[file.categoria] || categoryColors.informes;
                  const TypeIcon = getFileIcon(file.tipo_documento);
                  return (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {TypeIcon}
                          <span className="font-mono text-sm text-gray-700">
                            {file.nombre_archivo.length > 30
                              ? file.nombre_archivo.substring(0, 30) + "..."
                              : file.nombre_archivo}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${catStyle.bg} ${catStyle.text}`}>
                          {file.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 uppercase">{file.tipo_documento}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {file.descripcion || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {file.fecha_subida ? new Date(file.fecha_subida).toLocaleDateString("es-AR") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filteredFiles.length && (
              <div className="text-center py-12 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron archivos</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}