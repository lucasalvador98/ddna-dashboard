#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extrae del DEIS (ciclo 2024) las series que SOLO existen en PDF/XLSX y las deja
en `scripts/data/deis-vitales-2024.json` para que las cargue el ETL de Node.

Que saca de donde:
  - Boletin 175 (salud adolescente), CUADRO 5  -> tasa de fecundidad adolescente
    por jurisdiccion, 2013-2024.          (paginas fisicas 26)
  - Anuario de Estadisticas Vitales, CUADRO 44 -> razon de mortalidad materna
    por 10.000 nacidos vivos, 2000-2024.  (paginas fisicas 137-138, dos mitades)
  - Serie historica de defunciones por jurisdiccion 1914-2024 (XLSX del CKAN de
    salud; se baja si no esta).           (hoja unica, 25 columnas + anio)

Los tres comparten el mismo formato: una fila por jurisdiccion con los valores
en linea. `extract_text()` de pdfplumber los deja limpios, a diferencia de los
cuadros con filas cortadas (cuadro 1, 4, 22...) donde pdftotext/plumber mezclan
columnas. Esa es la razon de elegir justamente estos cuadros.

Se AUTOVALIDA al final y sale con error si algo no cuadra:
  * cuadro 5: la serie de Cordoba 2015-2022 debe coincidir con la que ya esta
    cargada en la base (27,8 / 25,4 / 24,0 / 21,9 / 19,3 / 14,6 / 12,9 / 12,8),
    que a su vez viene de la serie oficial que cargamos del ciclo anterior.
  * cuadro 44: Nacional 2024 = 4,4 y Cordoba 2024 = 3,8 (valores del propio PDF).
  * XLSX: nacional 2024 = 376.405 defunciones (coincide con el cuadro 1 del
    anuario) y Cordoba 2024 = 30.558.
"""
import sys, io, json, re, datetime, urllib.request
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

REPO = Path(__file__).resolve().parent.parent
DATA = REPO / "scripts" / "data"
CACHE = Path.home() / ".cache" / "deis"
DATA.mkdir(exist_ok=True)
CACHE.mkdir(exist_ok=True)

# ── fuentes ─────────────────────────────────────────────────────────────────
PDFS = Path(r"C:\Users\Usuario\DESARROLLO\Datos\datasets\datos")  # carpeta del usuario
BOLETIN = PDFS / "boletin_numero_175_adolescencia-ano_2024_20260320.vf_.pdf"
ANUARIO = PDFS / "serie_5_nro_68_anuario_vitales_2024_v2.pdf"
SERIE_HIST_URL = ("https://datos.salud.gob.ar/dataset/76ce7d19-921d-4d17-bb20-73c1fe55f07e"
                  "/resource/a73d215a-3bf2-45d9-9fbf-ed1e1a32fd8e/download/"
                  "serie-historica-defunciones-ocurridas-argentina-jurisdiccion-1914-2024.xlsx")
SERIE_HIST = CACHE / SERIE_HIST_URL.rsplit("/", 1)[1]
DEFUNCIONES_URL = ("https://datos.salud.gob.ar/dataset/27c588e8-43d0-411a-a40c-7ecc563c2c9f"
                   "/resource/28e2aef4-c536-43bc-a098-0bdfb9d7933c/download/defuncion2024.csv")
DEFUNCIONES = CACHE / DEFUNCIONES_URL.rsplit("/", 1)[1]

# ── jurisdicciones ──────────────────────────────────────────────────────────
# nombre tal como lo imprime el boletin/anuario -> nombre canonico del tablero
CANON = {
    "República Argentina": "Nacional",
    "REPUBLICA ARGENTINA": "Nacional",   # el anuario usa mayusculas sin acento
    "Ciud. Aut. de Bs. Aires": "Ciudad Autónoma de Buenos Aires",
    "Ciud. Aut. de Buenos Aires": "Ciudad Autónoma de Buenos Aires",
    "Buenos Aires": "Buenos Aires",
    "Catamarca": "Catamarca", "Córdoba": "Córdoba", "Corrientes": "Corrientes",
    "Chaco": "Chaco", "Chubut": "Chubut", "Entre Ríos": "Entre Ríos",
    "Formosa": "Formosa", "Jujuy": "Jujuy", "La Pampa": "La Pampa",
    "La Rioja": "La Rioja", "Mendoza": "Mendoza", "Misiones": "Misiones",
    "Neuquén": "Neuquén", "Río Negro": "Río Negro", "Salta": "Salta",
    "San Juan": "San Juan", "San Luis": "San Luis", "Santa Cruz": "Santa Cruz",
    "Santa Fe": "Santa Fe", "Santiago del Estero": "Santiago del Estero",
    "Tucumán": "Tucumán",
    "Tierra del Fuego": "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
}
VAL = re.compile(r"^(?:\d+,\d+|-)$")   # valor del cuadro: numero con coma decimal o "-"
NUM = re.compile(r"(\d+),(\d+)")

def to_float(v):
    if v == "-":
        return None
    m = NUM.match(v)
    if not m:
        raise ValueError("valor no parseable: %r" % v)
    return float("%s.%s" % (m.group(1), m.group(2)))

def parse_cuadro(text, anios, etiqueta):
    """Parses las filas de un cuadro tipo serie: nombre + N valores en la misma linea."""
    filas = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith(("DEIS -", "CUADRO", "JURISDICCION", "DE RESIDENCIA",
                                        "FALLECIDA", "República Argentina - Años",
                                        "según jurisdicción")):
            continue
        toks = line.split()
        if len(toks) < len(anios) + 1:
            continue
        vals, nombre = toks[-len(anios):], " ".join(toks[:-len(anios)])
        if not all(VAL.match(v) for v in vals):
            continue
        nombre = nombre.replace("*", "").strip()
        if nombre not in CANON:
            continue
        region = CANON[nombre]
        filas[region] = {a: to_float(v) for a, v in zip(anios, vals)}
    faltan = [a for a, v in filas.get("Nacional", {}).items() if v is None]
    if "Nacional" not in filas:
        raise SystemExit("ERROR: no se encontro la fila Nacional en %s" % etiqueta)
    print("   %-46s %2d jurisdicciones  (vacios nacionales: %s)"
          % (etiqueta, len(filas), faltan or "ninguno"))
    return filas

# ── 1. fecundidad adolescente (boletin 175, cuadro 5) ───────────────────────
print("Extrayendo...")
import pdfplumber
A1 = [str(y) for y in range(2013, 2025)]
with pdfplumber.open(str(BOLETIN)) as pdf:
    fecundidad = parse_cuadro(pdf.pages[25].extract_text() or "", A1,
                              "Boletin 175 cuadro 5 (fecundidad adolescente 2013-2024)")

# ── 2. mortalidad materna (anuario, cuadro 44: dos paginas) ─────────────────
A2 = [str(y) for y in range(2000, 2013)]
A3 = [str(y) for y in range(2013, 2025)]
with pdfplumber.open(str(ANUARIO)) as pdf:
    m1 = parse_cuadro(pdf.pages[136].extract_text() or "", A2, "Anuario cuadro 44 pag 137 (2000-2012)")
    m2 = parse_cuadro(pdf.pages[137].extract_text() or "", A3, "Anuario cuadro 44 pag 138 (2013-2024)")
materna = {r: {**m1.get(r, {}), **m2.get(r, {})} for r in set(m1) | set(m2)}

# ── 3. defunciones historicas por jurisdiccion (XLSX 1914-2024) ─────────────
if not SERIE_HIST.exists():
    print("   bajando la serie historica...")
    urllib.request.urlretrieve(SERIE_HIST_URL, SERIE_HIST)

# el CSV de defunciones 2024 entra aca solo como VALIDACION cruzada del XLSX:
# la suma de cantidad de una jurisdiccion debe coincidir con la serie historica.
if not DEFUNCIONES.exists():
    print("   bajando el CSV de defunciones 2024 (para validar)...")
    urllib.request.urlretrieve(DEFUNCIONES_URL, DEFUNCIONES)
import csv as csvmod
suma_cba, total_csv = 0.0, 0.0
with open(DEFUNCIONES, encoding="utf-8-sig", newline="") as fh:
    for row in csvmod.DictReader(fh, delimiter=";"):
        n = float(row.get("cantidad") or 0)
        total_csv += n
        if row.get("jurisdiccion_de_residencia_id", "").strip() == "14":
            suma_cba += n
print("   CSV defunciones 2024: total nacional %.0f, Cordoba %.0f" % (total_csv, suma_cba))
import openpyxl
wb = openpyxl.load_workbook(str(SERIE_HIST), read_only=True, data_only=True)
ws = wb[wb.sheetnames[0]]
rows = list(ws.iter_rows(values_only=True))
# mapeo por POSICION: la cabecera viene sin acentos y cortada ("cordoba",
# "neuquen" roto), asi que el nombre no es fiable; el orden de columnas si.
POS = [None, "Nacional", "Ciudad Autónoma de Buenos Aires", "Buenos Aires",
       "Catamarca", "Córdoba", "Corrientes", "Chaco", "Chubut", "Entre Ríos",
       "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
       "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz",
       "Santa Fe", "Santiago del Estero", "Tucumán",
       "Tierra del Fuego, Antártida e Islas del Atlántico Sur"]
historicas = {}
for row in rows[1:]:
    if row is None or row[0] is None:
        continue
    anio = row[0].year if isinstance(row[0], datetime.datetime) else int(str(row[0])[:4])
    for i, region in enumerate(POS[1:], start=1):
        if i >= len(row) or row[i] is None:
            continue
        historicas.setdefault(region, {})[str(anio)] = float(row[i])
print("   %-46s %2d jurisdicciones  (%d-%d)"
      % ("Serie historica defunciones (XLSX)", len(historicas),
         min(int(k) for k in historicas["Nacional"]), max(int(k) for k in historicas["Nacional"])))

# ── 4. boletin 174: series de supervivencia infantil 2001-2024 ──────────────
# 5 cuadros (4.1 TMI, 4.2 neonatal, 4.3 posneonatal, 4.4 de 1 a 4, 4.5 TMM5),
# cada uno partido en dos paginas (2001-2012 y 2013-2024, la segunda con
# "(Continuacion)"). Salen limpios por el mismo motivo que el cuadro 5/44.
BOLETIN174 = PDFS / "defunciones_de_menores_de_5_anos.indicadores_seleccionados-n-174-argentina_2024.vf_.pdf"
B174 = {
    "tasa_mortalidad_infantil": "CUADRO 4.1",
    "tasa_mortalidad_neonatal": "CUADRO 4.2",
    "tasa_mortalidad_posneonatal": "CUADRO 4.3",
    "tasa_mortalidad_1_a_4": "CUADRO 4.4",
    "tasa_mortalidad_menores_5": "CUADRO 4.5",
}
A4 = [str(y) for y in range(2001, 2013)]
A5 = [str(y) for y in range(2013, 2025)]
supervivencia = {}
with pdfplumber.open(str(BOLETIN174)) as pdf:
    for key, titulo in B174.items():
        pags = [i for i, pg in enumerate(pdf.pages, 1)
                if titulo in (pg.extract_text() or "")]
        if not pags:
            raise SystemExit("ERROR: no encontre %s en el boletin 174" % titulo)
        mitad1 = parse_cuadro(pdf.pages[pags[0]-1].extract_text() or "", A4, "%s pag %d" % (key, pags[0]))
        mitad2 = parse_cuadro(pdf.pages[pags[1]-1].extract_text() or "", A5, "%s pag %d" % (key, pags[1])) if len(pags) > 1 else {}
        mezcla = {r: {**mitad1.get(r, {}), **mitad2.get(r, {})} for r in set(mitad1) | set(mitad2)}
        supervivencia[key] = [{"region": r, "serie": mezcla[r]} for r in mezcla]

# ── autovalidacion ──────────────────────────────────────────────────────────
print("\nAUTOVALIDACION")
errores = []
def check(nombre, got, want, tol=0.05):
    ok = got is not None and abs(got - want) <= tol
    print("   %s %-52s -> %s (%s)" % ("OK  " if ok else "FAIL", nombre, got, want))
    if not ok:
        errores.append(nombre)

esperado_cba = {2015: 27.8, 2016: 25.4, 2017: 24.0, 2018: 21.9,
                2019: 19.3, 2020: 14.6, 2021: 12.9, 2022: 12.8}
for a, v in esperado_cba.items():
    check("fecundidad adolescente Cordoba %d (vs base)" % a, fecundidad["Córdoba"].get(str(a)), v)
check("fecundidad adolescente Nacional 2024", fecundidad["Nacional"].get("2024"), 9.7)
check("fecundidad adolescente Cordoba 2024 (nuevo)", fecundidad["Córdoba"].get("2024"), 8.8)
check("mortalidad materna Nacional 2024", materna["Nacional"].get("2024"), 4.4)
check("mortalidad materna Cordoba 2024", materna["Córdoba"].get("2024"), 3.8)
check("defunciones historicas Nacional 2024 (cuadro 1)", historicas["Nacional"].get("2024"), 376405.0, 0.5)
check("defunciones Cordoba 2024: XLSX vs CSV", historicas["Córdoba"].get("2024"), suma_cba, 0.5)
if supervivencia["tasa_mortalidad_menores_5"]:
    s5 = {x["region"]: x["serie"] for x in supervivencia["tasa_mortalidad_menores_5"]}
    check("TMM5 Cordoba 2024 (cuadro 3 del mismo boletin)", s5.get("Córdoba", {}).get("2024"), 8.2)
    check("TMM5 Nacional 2024 (cuadro 3 del mismo boletin)", s5.get("Nacional", {}).get("2024"), 10.2)

if errores:
    raise SystemExit("ERROR: %d validaciones fallaron: %s" % (len(errores), ", ".join(errores)))

salida = {
    "_meta": {
        "generado": datetime.datetime.now().isoformat(timespec="seconds"),
        "procesamiento": "scripts/extract-deis-2024.py (pdfplumber %s + openpyxl)"
                         % __import__("pdfplumber").__version__,
        "fuentes": {
            "fecundidad_adolescente": {
                "pdf": BOLETIN.name,
                "cuadro": "5 - Tasa de fecundidad adolescente por cada 1.000 mujeres, "
                          "segun jurisdiccion de residencia. Republica Argentina - Anios 2013-2024",
                "definicion": "nacidos vivos de madres de 10 a 19 / mujeres de 10 a 19 x 1000",
            },
            "mortalidad_materna": {
                "pdf": ANUARIO.name,
                "cuadro": "44 - Razon de mortalidad materna por 10.000 nacidos vivos, "
                          "por jurisdiccion de residencia. Anios 2000 a 2024",
            },
            "defunciones_historicas": {"xlsx": SERIE_HIST_URL,
                                   "validado_contra": DEFUNCIONES_URL},
            "anuario": "Serie 5 Nro 68, ISSN 1668-9054, Buenos Aires, enero de 2026",
        },
        "validaciones": "Cordoba 2015-2022 fecundidad adolescente = serie oficial ya cargada; "
                        "defunciones 2024 = cuadro 1 del anuario; exit 1 si algo no cuadra.",
    },
    "fecundidad_adolescente": [{"region": r, "serie": fecundidad[r]} for r in fecundidad],
    "mortalidad_materna": [{"region": r, "serie": materna[r]} for r in materna],
    "defunciones_historicas": [{"region": r, "serie": historicas[r]} for r in historicas],
    "supervivencia_infantil": supervivencia,
}
out = DATA / "deis-vitales-2024.json"
out.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
print("\nOK -> %s (%.1f KB)" % (out, out.stat().st_size / 1024))
