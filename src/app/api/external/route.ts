import { NextResponse } from "next/server";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const CKAN_DATOS_GOB_AR = "https://datos.gob.ar/api/3/action";
const CKAN_GESTION_ABIERTA_CBA = "https://datosgestionabierta.cba.gov.ar/api/3/action";
const SENAF_CSV = "https://datosabiertos.desarrollosocial.gob.ar";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function ckanFetch(baseUrl: string, action: string, params: Record<string, string> = {}) {
  const url = new URL(`${baseUrl}/${action}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
    next: { revalidate: 3600 }, // cache 1h
  });
  if (!res.ok) throw new Error(`CKAN ${action} returned ${res.status}`);
  return res.json();
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source"); // datosgob | cba | senaf | indec
  const action = searchParams.get("action");  // list | search | show | download
  const id = searchParams.get("id");          // dataset id
  const q = searchParams.get("q");            // search query
  const limit = searchParams.get("limit") || "50";
  const org = searchParams.get("org");        // organization filter

  try {
    // ── datos.gob.ar (Nacional) ────────────────────────────────────────────
    if (source === "datosgob") {
      if (action === "list" || !action) {
        const data = await ckanFetch(CKAN_DATOS_GOB_AR, "package_list", { limit });
        // Filter to relevant themes
        const relevant = (data.result as string[]).filter((name: string) =>
          /educacion|salud|ninez|ninios|adolesc|pobreza|trabajo|ingresos|indicadores/.test(name)
        );
        return NextResponse.json({
          source: "datos.gob.ar",
          total: relevant.length,
          datasets: relevant,
        });
      }

      if (action === "show" && id) {
        const data = await ckanFetch(CKAN_DATOS_GOB_AR, "package_show", { id });
        const r = data.result;
        return NextResponse.json({
          source: "datos.gob.ar",
          name: r.name,
          title: r.title,
          notes: r.notes,
          organization: r.organization?.title,
          resources: r.resources?.map((res: any) => ({
            id: res.id,
            name: res.name,
            format: res.format,
            url: res.url,
            description: res.description,
          })),
        });
      }

      if (action === "search" && q) {
        const data = await ckanFetch(CKAN_DATOS_GOB_AR, "package_search", {
          q,
          rows: limit,
        });
        const results = (data.result?.results || []).map((r: any) => ({
          name: r.name,
          title: r.title,
          organization: r.organization?.title,
          num_resources: r.num_resources,
        }));
        return NextResponse.json({
          source: "datos.gob.ar",
          query: q,
          count: data.result?.count,
          results,
        });
      }

      if (action === "orgs") {
        const data = await ckanFetch(CKAN_DATOS_GOB_AR, "organization_list", {
          all_fields: "true",
          limit,
        });
        const orgs = (data.result || []).map((o: any) => ({
          name: o.name,
          title: o.title,
        }));
        return NextResponse.json({
          source: "datos.gob.ar",
          organizations: orgs,
        });
      }

      if (action === "org" && org) {
        const data = await ckanFetch(CKAN_DATOS_GOB_AR, "organization_show", {
          id: org,
          include_datasets: "true",
          limit,
        });
        const datasets = (data.result?.datasets || []).map((d: any) => ({
          name: d.name,
          title: d.title,
          num_resources: d.num_resources,
        }));
        return NextResponse.json({
          source: "datos.gob.ar",
          organization: data.result?.title,
          datasets,
        });
      }
    }

    // ── Gestión Abierta Córdoba (Provincial) ───────────────────────────────
    if (source === "cba") {
      if (action === "list" || !action) {
        const data = await ckanFetch(CKAN_GESTION_ABIERTA_CBA, "package_list", { limit });
        const relevant = (data.result as string[]).filter((name: string) =>
          /salud|educacion|seguridad|presupuesto|ninez|pobreza|poblacion/.test(name)
        );
        return NextResponse.json({
          source: "Gestión Abierta Córdoba",
          total: relevant.length,
          datasets: relevant,
        });
      }

      if (action === "show" && id) {
        const data = await ckanFetch(CKAN_GESTION_ABIERTA_CBA, "package_show", { id });
        const r = data.result;
        return NextResponse.json({
          source: "Gestión Abierta Córdoba",
          name: r.name,
          title: r.title,
          notes: r.notes,
          organization: r.organization?.title,
          resources: r.resources?.map((res: any) => ({
            id: res.id,
            name: res.name,
            format: res.format,
            url: res.url,
          })),
        });
      }

      if (action === "search" && q) {
        const data = await ckanFetch(CKAN_GESTION_ABIERTA_CBA, "package_search", {
          q,
          rows: limit,
        });
        const results = (data.result?.results || []).map((r: any) => ({
          name: r.name,
          title: r.title,
          num_resources: r.num_resources,
        }));
        return NextResponse.json({
          source: "Gestión Abierta Córdoba",
          query: q,
          count: data.result?.count,
          results,
        });
      }
    }

    // ── SENAF Nacional (CSVs directos) ──���────────────────────────────────────
    if (source === "senaf") {
      if (action === "list" || !action) {
        // Datasets SENAF en datos.gob.ar
        const data = await ckanFetch(CKAN_DATOS_GOB_AR, "package_list", { limit: "500" });
        const senafDatasets = (data.result as string[]).filter((name: string) =>
          /desarrollo-social.*ninez|desarrollo-social.*adolesc|desarrollo-social.*senaf/.test(name)
        );
        return NextResponse.json({
          source: "SENAF Nacional / datos.gob.ar",
          datasets: senafDatasets,
          note: "Los CSVs directos están disponibles abajo",
          csv_urls: {
            actividades_senaf:
              "https://datosabiertos.desarrollosocial.gob.ar/dataset/91cf1264-593f-4714-ad21-aad425bce53b/resource/7fa33241-09c0-4692-a278-4bac608c8286/download/sintesis-rafp-senaf.csv",
            adolescentes_infractores:
              "https://datosabiertos.desarrollosocial.gob.ar/dataset/f64aa566-35a7-4371-b18e-9c1e383ace7f/resource/d2e93ad6-d321-4d63-9256-205c4c640b99/download/dispositivos-de-aprehension-dinai-2021-2022-y-2023.csv",
          },
        });
      }

      if (action === "download" && id) {
        const csvUrls: Record<string, string> = {
          senaf_actividades:
            "https://datosabiertos.desarrollosocial.gob.ar/dataset/91cf1264-593f-4714-ad21-aad425bce53b/resource/7fa33241-09c0-4692-a278-4bac608c8286/download/sintesis-rafp-senaf.csv",
          adolescentes:
            "https://datosabiertos.desarrollosocial.gob.ar/dataset/f64aa566-35a7-4371-b18e-9c1e383ace7f/resource/d2e93ad6-d321-4d63-9256-205c4c640b99/download/dispositivos-de-aprehension-dinai-2021-2022-y-2023.csv",
        };

        const csvUrl = csvUrls[id];
        if (!csvUrl) {
          return NextResponse.json({ error: "CSV id not found" }, { status: 404 });
        }

        const res = await fetch(csvUrl, { next: { revalidate: 86400 } }); // cache 24h
        if (!res.ok) {
          return NextResponse.json(
            { error: `Failed to download CSV: ${res.status}` },
            { status: 502 }
          );
        }

        const text = await res.text();
        const lines = text.split("\n").map((l) => l.split(","));
        const headers = lines[0] || [];
        const rows = lines.slice(1).filter((l) => l.some((c) => c.trim()));

        return NextResponse.json({
          source: "SENAF Nacional",
          csv_id: id,
          headers,
          row_count: rows.length,
          preview: rows.slice(0, 10),
        });
      }
    }

    // ── INDEC ───────────────────────────────────────────────────────────────
    if (source === "indec") {
      return NextResponse.json({
        source: "INDEC Argentina",
        apis: {
          shiny_visualizaciones: {
            url: "https://shiny.indec.gob.ar/",
            type: "shiny",
            status: "✅ Activo",
            description: "Visualizaciones interactivas (R/Shiny)",
          },
          ftp: {
            url: "https://www.indec.gob.ar/ftp/",
            type: "ftp",
            status: "✅ Activo",
            description: "FTP con PDFs, tablas y cuadritos",
          },
          bases_datos: {
            url: "https://www.indec.gob.ar/.../BasesDeDatos",
            type: "web",
            status: "✅ Activo",
            description: "Microdatos EPH ( Encuesta Permanente de Hogares)",
          },
          dosier_nnya: {
            url: "https://www.indec.gob.ar/ftp/cuadros/poblacion/dosier_nnya_11_237A4EFD2B08.pdf",
            type: "pdf",
            status: "✅ Disponible",
            description: "Dosier estadístico de NNyA (última edición 2023)",
          },
          nsdp: {
            url: "https://sdds.indec.gob.ar/",
            type: "web",
            status: "✅ Activo",
            description: "NSDP - Metadatos y estándares IMF",
          },
          api_rest: {
            type: "rest",
            status: "❌ No disponible",
            description: "INDEC no tiene API REST pública",
          },
        },
        datasets_en_datos_gob_ar: {
          // These are on datos.gob.ar but from INDEC organization
          eph: "trabajo-eph-2016-2024",
          indicadores_sociales: "indicadores-sociales-ipmh",
          nbi: "Necesidades Básicas Insatisfechas (en CNPV)",
        },
      });
    }

    // ── Contextual / Enrichment ─────────────────────────────────────────────
    if (source === "contextual") {
      return NextResponse.json({
        source: "Indicadores Contextuales",
        description: "Indicadores no-NNyA que enriquecen el dashboard",
        indicators: [
          {
            name: "IPC Córdoba (inflación)",
            source: "INDEC / Dirección Estadística CBA",
            url: "https://estadistica.cba.gov.ar/",
            update: "mensual",
            use: "Deflactar inversión real",
            available: "❌ Sin API — descarga manual",
          },
          {
            name: "Tasa de empleo/desempleo juvenil (15-29)",
            source: "INDEC EPH",
            url: "https://www.indec.gob.ar/.../BasesDeDatos/EPH",
            update: "trimestral",
            use: "Contexto laboral adolescentes",
            available: "⚠️ Microdatos — requiere procesamiento",
          },
          {
            name: "NBI por provincia",
            source: "INDEC CNPV 2022",
            url: "https://www.indec.gob.ar/.../BasesDeDatos/CNPV",
            update: "decenal",
            use: "Pobreza estructural de fondo",
            available: "⚠️ CSV en datos.gob.ar",
          },
          {
            name: "PBI per cápita Córdoba",
            source: "Dirección Estadística CBA",
            url: "https://estadistica.cba.gov.ar/",
            update: "anual",
            use: "Escala económica provincial",
            available: "❌ Sin API — descarga manual",
          },
        ],
      });
    }

    // ── Info general ─────────────────────────────────────────────────────────
    if (action === "info" || !source) {
      return NextResponse.json({
        name: "DDNA External APIs",
        version: "1.0",
        endpoints: {
          source: "datosgob | cba | senaf | indec | contextual",
          actions: {
            datosgob: "list | show | search | orgs | org",
            cba: "list | show | search",
            senaf: "list | download",
            indec: "(info only)",
            contextual: "(info only)",
          },
        },
        examples: {
          catalogo_nacional: "/api/external?source=datosgob&action=list",
          buscar_educacion: "/api/external?source=datosgob&action=search&q=educacion",
          detalle_dataset: "/api/external?source=datosgob&action=show&id=educacion-aprender-2023",
          organizaciones: "/api/external?source=datosgob&action=orgs",
          datasets_cba: "/api/external?source=cba&action=list",
          senaf_csv: "/api/external?source=senaf&action=list",
          descargar_senaf: "/api/external?source=senaf&action=download&id=senaf_actividades",
        },
      });
    }

    return NextResponse.json(
      { error: "Unknown source or action. Try ?source=datosgob" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[external API]", err);
    return NextResponse.json(
      { error: "External API error", detail: String(err) },
      { status: 500 }
    );
  }
}