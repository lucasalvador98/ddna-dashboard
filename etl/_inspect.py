#!/usr/bin/env python3
"""
Inspector de archivos de datos para el ETL DDNA.

Fase 1: Lee cada archivo Excel y muestra su estructura
(hojas, columnas, tipos, preview) para entender los datos
antes de escribir las transformaciones.

Uso:
    python inspect.py                  # Inspeccionar todos los archivos
    python inspect.py --category salud  # Solo categoría específica
    python inspect.py --file path/to/file.xlsx  # Archivo específico
"""
import argparse
import json
import logging
import sys
from pathlib import Path

# Agregar el directorio padre al path para imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

# import removed to avoid circular dependency

# Helper to list Excel files for a category
def list_excel_files(category: str):
    # Local import to avoid circular dependency
    from etl.extract import find_data_files
    return find_data_files(category, DATA_FILES)
from etl.config import DATA_FILES, RAW_DATA_DIR

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspector de archivos de datos DDNA")
    parser.add_argument(
        "--category", "-c",
        choices=["salud", "educacion", "pobreza", "seguridad", "demografia", "inversion"],
        help="Inspeccionar solo una categoría",
    )
    parser.add_argument(
        "--file", "-f",
        type=Path,
        help="Inspeccionar un archivo específico",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Salida en formato JSON",
    )
    args = parser.parse_args()

    results: list[dict] = []

    # Simplified inspector: list Excel files per category
    if args.file:
        # List specific file info (placeholder)
        results.append({"file": str(args.file), "note": "Inspection not implemented"})
    elif args.category:
        files = list_excel_files(args.category)
        if not files:
            print(f"No hay archivos para la categoría '{args.category}'")
            return
        for filepath in files:
            results.append({"file": str(filepath), "note": "Inspection not implemented"})
    else:
        for category in DATA_FILES.keys():
            files = list_excel_files(category)
            if not files:
                print(f"\n📁 {category.upper()}: Sin archivos de datos")
                continue
            print(f"\n📁 {category.upper()}:")
            for filepath in files:
                results.append({"file": str(filepath), "note": "Inspection not implemented"})

    # Salida
    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False, default=str))
    else:
        for result in results:
            print(f"\n{'='*60}")
            print(f"📄 Archivo: {result.get('file', 'N/A')}")

            if "error" in result:
                print(f"❌ Error: {result['error']}")
                continue

            for sheet in result.get("sheets", []):
                print(f"\n  📊 Hoja: {sheet['name']} ({sheet['rows']} filas)")
                print(f"     Columnas: {', '.join(sheet['columns'][:10])}")
                if len(sheet['columns']) > 10:
                    print(f"     ... y {len(sheet['columns']) - 10} más")
                print(f"     Tipos: {sheet['dtypes']}")
                if sheet['preview']:
                    print(f"     Preview (primeras 3 filas):")
                    for i, row in enumerate(sheet['preview'][:3]):
                        print(f"       {i+1}: {json.dumps(row, ensure_ascii=False, default=str)[:200]}")

    print(f"\n{'='*60}")
    print(f"Total archivos inspeccionados: {len(results)}")
    total_sheets = sum(len(r.get("sheets", [])) for r in results)
    print(f"Total hojas: {total_sheets}")


if __name__ == "__main__":
    main()