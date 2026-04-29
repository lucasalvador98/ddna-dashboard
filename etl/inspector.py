#!/usr/bin/env python3
"""
Inspector de archivos de datos de DDNA.
Simplificado para listar archivos Excel por categoría.
"""
import argparse
import json
import logging
import sys
from pathlib import Path

# Agregar el directorio raíz del repo al path para que se puedan importar módulos de etl
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from etl.config import DATA_FILES

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def list_excel_files(category: str):
    # Local import to avoid circular dependency
    from etl.extract import find_data_files
    return find_data_files(category, DATA_FILES)

def main() -> None:
    parser = argparse.ArgumentParser(description="Inspector de archivos de datos DDNA")
    parser.add_argument("--category", "-c", choices=["salud", "educacion", "pobreza", "seguridad", "demografia", "inversion"], help="Inspeccionar solo una categoría")
    parser.add_argument("--file", "-f", type=Path, help="Inspeccionar un archivo específico")
    parser.add_argument("--json", action="store_true", help="Salida en formato JSON")
    args = parser.parse_args()

    results: list[dict] = []
    if args.file:
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

    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False, default=str))
    else:
        for result in results:
            print(f"\n{'='*60}")
            print(f"📄 Archivo: {result.get('file', 'N/A')}")
            print(f"Nota: {result.get('note', '')}")
    print(f"\n{'='*60}\nTotal archivos listados: {len(results)}")

if __name__ == "__main__":
    main()
