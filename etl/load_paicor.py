#!/usr/bin/env python3
"""
ETL script para cargar datos PAICOR desde CKAN a Supabase.

Years: 2017-2022
- 2018: ya descargado en etl/paicor_2018.csv
- Otros anios: descargar desde CKAN datastore URLs
"""

import csv
import io
import sys
import urllib.request
from pathlib import Path

# CKAN datastore URLs por anio
CKAN_URLS = {
    2017: "https://datosgestionabierta.cba.gov.ar/datastore/dump/ce3cd34e-3a37-4005-a030-df5c1bec0a53",
    2019: "https://datosgestionabierta.cba.gov.ar/datastore/dump/b92a2e2d-25ce-4622-8291-ec7aad9af7a0",
    2020: "https://datosgestionabierta.cba.gov.ar/datastore/dump/7bb24e17-1d6f-443b-8e64-4fa0e5aa8a22",
    2021: "https://datosgestionabierta.cba.gov.ar/datastore/dump/c4ac7346-920d-4fbf-8795-fa0edbe8da06",
    2022: "https://datosgestionabierta.cba.gov.ar/datastore/dump/022a6974-b88b-4a4a-98c9-68816d85af3e",
}

BASE_DIR = Path(__file__).parent.resolve()
PAICOR_2018_FILE = BASE_DIR / "paicor_2018.csv"
OUTPUT_DIR = BASE_DIR / "output"


def fix_encoding(text):
    """Fix problematic encoding in CKAN data."""
    if not text:
        return text
    # Replace MA + 3chars + NA with MAÑANA
    if len(text) == 5 and text.startswith("MA") and text.endswith("NA"):
        return "MAÑANA"
    import re
    return re.sub(r'MA...NA', 'MAÑANA', text)


def download_csv(url, anio):
    """Descarga un CSV desde URL y lo parsea."""
    print(f"Descargando {anio} desde {url}...")

    try:
        with urllib.request.urlopen(url, timeout=60) as response:
            content = response.read().decode("utf-8")
    except Exception as e:
        print(f"Error descargando {anio}: {e}")
        return []

    reader = csv.DictReader(io.StringIO(content))
    rows = []
    for row in reader:
        rows.append({
            "id": row.get("_id", ""),
            "departamento": row.get("N_DEPARTAMENTO", "").strip(),
            "turno": row.get("N_TURNO", "").strip(),
            "nivel": row.get("N_NIVEL", "").strip(),
            "cant_benef": row.get("CANT_BENEF", "0"),
        })

    print(f"  -> {len(rows)} filas descargadas")
    return rows


def read_local_csv(file_path, anio):
    """Lee un CSV local."""
    print(f"Leyendo {anio} desde archivo local {file_path}...")

    if not file_path.exists():
        print(f"  -> ERROR: archivo no existe")
        return []

    rows = []
    with open(file_path, "r", encoding="latin-1", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            depto = row.get("N_DEPARTAMENTO", "").strip()
            turno = row.get("N_TURNO", "").strip()
            nivel = row.get("N_NIVEL", "").strip()

            turno = fix_encoding(turno)

            rows.append({
                "id": row.get("_id", ""),
                "departamento": depto,
                "turno": turno,
                "nivel": nivel,
                "cant_benef": row.get("CANT_BENEF", "0"),
            })

    print(f"  -> {len(rows)} filas leidas")
    return rows


def generate_sql_inserts(rows, anio):
    """Genera SQL INSERT para Supabase."""
    if not rows:
        return ""

    values = []
    seen = set()

    for row in rows:
        dept = row.get("departamento", "").upper()
        turno = row.get("turno", "").upper()
        nivel = row.get("nivel", "").upper()
        cant = int(row.get("cant_benef", "0") or "0")

        if not dept or cant <= 0:
            continue

        # Fix encoding
        turno = fix_encoding(turno)
        if turno.startswith("MA") and turno.endswith("NA") and len(turno) == 5:
            turno = "MAÑANA"
        if "TARDE" in turno:
            turno = "TARDE"
        if "NOCHE" in turno:
            turno = "NOCHE"

        # Avoid duplicates
        key = (dept, turno, nivel, anio)
        if key in seen:
            continue
        seen.add(key)

        dept_sql = dept.replace("'", "''")
        turno_sql = turno.replace("'", "''")
        nivel_sql = nivel.replace("'", "''")

        values.append(
            f"({anio}, '{dept_sql}', '{turno_sql}', '{nivel_sql}', {cant}, 'api')"
        )

    if not values:
        return ""

    sql = f"""
-- Insertar datos PAICOR anio {anio}
INSERT INTO paicor (anio, departamento, turno, nivel, cant_beneficios, fuente)
VALUES
{','.join(values)}
ON CONFLICT (anio, departamento, turno, nivel) DO UPDATE SET
    cant_beneficios = EXCLUDED.cant_beneficios;
"""
    return sql


def main():
    """Ejecuta el ETL."""
    print("=" * 60)
    print("ETL PAICOR: Cargar datos a Supabase")
    print("=" * 60)

    OUTPUT_DIR.mkdir(exist_ok=True)

    all_sql = []
    total_rows = 0

    # 2018 desde archivo local
    rows_2018 = read_local_csv(PAICOR_2018_FILE, 2018)
    if rows_2018:
        sql = generate_sql_inserts(rows_2018, 2018)
        if sql:
            all_sql.append(sql)
            total_rows += len(rows_2018)

    # Otros anios desde CKAN
    for anio, url in CKAN_URLS.items():
        rows = download_csv(url, anio)
        if rows:
            sql = generate_sql_inserts(rows, anio)
            if sql:
                all_sql.append(sql)
                total_rows += len(rows)

    if not all_sql:
        print("ERROR: No se generaron INSERTs")
        sys.exit(1)

    full_sql = "\n\n".join(all_sql)

    output_file = OUTPUT_DIR / "load_paicor_inserts.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(full_sql)

    print("=" * 60)
    print(f"RESUMEN:")
    print(f"  - Total filas procesadas: {total_rows}")
    print(f"  - SQL generado: {output_file}")
    print("=" * 60)


if __name__ == "__main__":
    main()