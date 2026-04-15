"""
Configuración del ETL para el Tablero DDNA.
"""
import os
from pathlib import Path

# ── Supabase ──
SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    "https://ppyyqrvirjqmfpqaqnxy.supabase.co",
)
SUPABASE_ANON_KEY = os.environ.get(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXlxcnZpcmpxbWZwcWFxbnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5MDMwNSwiZXhwIjoyMDkxNzY2MzA1fQ.g3NSsIO2Y6qGTtfvBQciTfTWyQIW0ev2tuUjY5QcYLM",
)
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# ── Rutas ──
BASE_DIR = Path(__file__).resolve().parent
# Datos originales en carpeta DDNA original
RAW_DATA_DIR = Path("E:/Backup Luca/DDNA/datos/raw")
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Mapeo de archivos por categoría ──
DATA_FILES: dict[str, list[Path]] = {
    "salud": [
        RAW_DATA_DIR / "deis" / "datosDeis-2024-07-26 (3).xlsx",
        RAW_DATA_DIR / "deis" / "Mortalidad infantil Nacion-Provincia.xlsx",
        RAW_DATA_DIR / "deis" / "Edad_Madre 2022.xlsx",
        RAW_DATA_DIR / "censo-2022" / "Cobertura_Salud-Censo.xlsx",
    ],
    "educacion": [
        RAW_DATA_DIR / "censo-2022" / "Educacion por nivel.xlsx",
        RAW_DATA_DIR / "censo-2022" / "Educacion por edades.xlsx",
        RAW_DATA_DIR / "aprender" / "Educacion Provincia.xlsx",
    ],
    "pobreza": [
        RAW_DATA_DIR / "pobreza" / "cuadros_informe_pobreza_09_24 (1).xls",
        RAW_DATA_DIR / "pobreza" / "Encoprac 16 a 24 años.xlsx",
        RAW_DATA_DIR / "pobreza" / "cuadros_encoprac_2022.xlsx",
    ],
    "seguridad": [
        RAW_DATA_DIR / "justicia" / "Justicia_cba_2022.xlsx",
    ],
    "demografia": [
        RAW_DATA_DIR / "censo-2022" / "censo poblacion.xlsx",
        RAW_DATA_DIR / "deis" / "Edad_Madre 2022.xlsx",
        RAW_DATA_DIR / "deis" / "datosDeis-2024-07-26 (3).xlsx",
    ],
    "inversion": [],  # Sin archivos aún
}

# ── Unidades permitidas ──
VALID_UNITS = {"%", "‰", "Md", "hab", "casos"}

# ── Categorías válidas ──
VALID_CATEGORIES = {"salud", "educacion", "pobreza", "seguridad", "inversion", "demografia"}