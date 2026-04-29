"use client";

import { Map, Layers, Eye, MapPin } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "@/components/section-header";

// Capas disponibles de IDECOR
const GEOLAYERS = [
  {
    id: "barrios",
    nombre: "Barrios",
    descripcion: "Límites de barrios de la ciudad de Córdoba",
    url: "https://mapascordoba.gob.ar/viewer/mapa/101",
    color: "#3777FF",
  },
  {
    id: "cpc",
    nombre: "Centros de Participación Comunitaria",
    descripcion: "CPC - Centros de servicios municipales",
    url: "https://mapascordoba.gob.ar/viewer/mapa/102",
    color: "#FF7F11",
  },
  {
    id: "salud",
    nombre: "Red de Salud",
    descripcion: "Hospitales y centros de salud",
    url: "https://mapascordoba.gob.ar/viewer/mapa/301",
    color: "#E07A5F",
  },
  {
    id: "escuelas",
    nombre: "Establecimientos Educativos",
    descripcion: "Escuelas y colegios",
    url: "https://mapascordoba.gob.ar/viewer/mapa/201",
    color: "#F3A712",
  },
  {
    id: "censo",
    nombre: "Datos Censales",
    descripcion: "Información demográfica por zona",
    url: "https://mapascordoba.gob.ar/viewer/mapa/401",
    color: "#BF1363",
  },
  {
    id: "siniestralidad",
    nombre: "Siniestralidad Vial",
    descripcion: "Puntos con accidentes de tránsito",
    url: "https://mapascordoba.gob.ar/viewer/mapa/108",
    color: "#EF4444",
  },
];

export default function GeoPage() {
  const [selectedLayer, setSelectedLayer] = useState(GEOLAYERS[0]);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Map}
        title="Mapas Geográficos"
        description="Visualizaciones territoriales interactivas - Provincia de Córdoba"
        color="blue"
      />

      {/* Introducción */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-700">Mapas Córdoba - IDECOR</h3>
            <p className="text-sm text-blue-600 mt-1">
              El proyecto cuenta con capas geográficas del Instituto de Estadísticas y Censos de Córdoba (IDECOR).
              Haz clic en una capa paraAbrir el visor interactivo en una nueva pestaña.
            </p>
          </div>
        </div>
      </div>

      {/* Selector de capas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GEOLAYERS.map((layer) => (
          <button
            key={layer.id}
            onClick={() => setSelectedLayer(layer)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              selectedLayer.id === layer.id
                ? "border-[#3777FF] bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: layer.color + "20" }}
              >
                <MapPin className="w-5 h-5" style={{ color: layer.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{layer.nombre}</h3>
                <p className="text-xs text-gray-500">{layer.descripcion}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Vista previa del mapa seleccionado */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">{selectedLayer.nombre}</span>
          </div>
          <a
            href={selectedLayer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            Abrir en nuova scheda
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        
        {/* Placeholder del mapa */}
        <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{selectedLayer.nombre}</p>
            <p className="text-gray-400 text-sm mt-1">
              Haz clic en "Abrir en nuova scheda" per visualizar el mapa interactivo
            </p>
          </div>
        </div>
      </div>

      {/*Leyenda */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-medium text-gray-700 mb-3">Leyenda de colores</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GEOLAYERS.map((layer) => (
            <div key={layer.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: layer.color }}
              />
              <span className="text-sm text-gray-600">{layer.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}