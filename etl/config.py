"""
Configuración del ETL para el Tablero DDNA.
"""
import os
from pathlib import Path

# ── Supabase ──
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# ── Rutas ──
BASE_DIR = Path(__file__).resolve().parent
# Datos locales en la carpeta del proyecto
RAW_DATA_DIR = BASE_DIR.parent / "datos" / "raw"
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Mapeo de archivos por categoría ──
DATA_FILES: dict[str, list[Path]] = {
    "salud": [
        RAW_DATA_DIR / "deis" / "datosDeis-2024-07-26 (3).xlsx",
        RAW_DATA_DIR / "deis" / "Mortalidad infantil Nacion-Provincia.xlsx",
        RAW_DATA_DIR / "deis" / "Edad_Madre 2022.xlsx",
        RAW_DATA_DIR / "censo-2022" / "salud" / "Cobertura_Salud-Censo.xlsx",
        RAW_DATA_DIR / "salud_adolescente" / "salud adolescente deis.xlsx",
    ],
    "educacion": [
        RAW_DATA_DIR / "censo-2022" / "educacion" / "Educacion por nivel.xlsx",
        RAW_DATA_DIR / "censo-2022" / "educacion" / "Educacion por edades.xlsx",
        RAW_DATA_DIR / "educacion" / "Educacion Provincia.xlsx",
        RAW_DATA_DIR / "educacion" / "Datos escolarización.xlsx",
        RAW_DATA_DIR / "aprender" / "aprender 2024.xlsx",
    ],
    "pobreza": [
        RAW_DATA_DIR / "pobreza" / "cuadros_informe_pobreza_09_24 (1).xlsx",
    ],
    "seguridad": [
        RAW_DATA_DIR / "justicia" / "Justicia_cba_2022.xlsx",
    ],
    "demografia": [
        RAW_DATA_DIR / "censo-2022" / "demografia" / "censo poblacion.xlsx",
    ],
    "inversion": [
        RAW_DATA_DIR / "inversion" / "BASE DE DATOS.xlsx",
    ],
}

# ── Unidades permitidas ──
VALID_UNITS = {"%", "‰", "Md", "hab", "casos"}

# ── Categorías válidas ──
VALID_CATEGORIES = {"salud", "educacion", "pobreza", "seguridad", "inversion", "demografia"}