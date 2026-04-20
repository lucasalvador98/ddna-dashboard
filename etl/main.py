#!/usr/bin/env python3
"""
ETL DDNA - Tablero de Monitoreo
=================================

Pipeline de Extracción, Transformación y Carga de datos
para el Tablero de Monitoreo de la DDNA.

Uso:
    python main.py inspect                    # Inspeccionar archivos de datos
    python main.py transform --category salud # Transformar categoría específica
    python main.py transform --all            # Transformar todas las categorías
    python main.py load --method sql          # Generar archivos SQL
    python main.py load --method api          # Cargar vía API (necesita SERVICE_ROLE_KEY)
    python main.py etl --category salud       # Pipeline completo por categoría
    python main.py etl --all                  # Pipeline completo para todas
"""
import argparse
import json
import logging
import sys
from pathlib import Path

# Agregar directorio raíz del repo al path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from etl.config import DATA_FILES, OUTPUT_DIR, VALID_CATEGORIES
from etl.extract import find_data_files
from etl.transform.salud import transform_salud
from etl.transform.educacion import transform_educacion
from etl.transform.pobreza import transform_pobreza
from etl.transform.seguridad import transform_seguridad
from etl.transform.demografia import transform_demografia
from etl.load.sql_generator import generate_upsert_sql, generate_combined_sql
from etl.load.supabase_loader import SupabaseLoader

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

TRANSFORMERS = {
    "salud": transform_salud,
    "educacion": transform_educacion,
    "pobreza": transform_pobreza,
    "seguridad": transform_seguridad,
    "demografia": transform_demografia,
}


def cmd_inspect(args: argparse.Namespace) -> None:
    """Ejecuta el inspector de datos."""
    import subprocess

    cmd = [sys.executable, str(Path(__file__).parent / "inspector.py")]
    if args.category:
        cmd.extend(["--category", args.category])

    subprocess.run(cmd, check=False)


def cmd_transform(args: argparse.Namespace) -> None:
    """Transforma datos de una o todas las categorías."""
    categories = VALID_CATEGORIES if args.all else {args.category}
    all_records: dict[str, list] = {}
    total = 0

    for category in categories:
        if category not in TRANSFORMERS:
            logger.warning("Sin transformador para categoría: %s", category)
            continue

        files = find_data_files(category, DATA_FILES)
        if not files:
            logger.info("Sin archivos para categoría: %s", category)
            continue

        logger.info("Transformando categoría: %s (%d archivos)", category, len(files))
        transformer = TRANSFORMERS[category]
        records = transformer()

        logger.info("Categoría %s: %d registros transformados", category, len(records))
        all_records[category] = records
        total += len(records)

        # Guardar JSON intermedio
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        json_path = OUTPUT_DIR / f"{category}_transformed.json"
        json_path.write_text(
            json.dumps(records, indent=2, ensure_ascii=False, default=str),
            encoding="utf-8",
        )
        logger.info("JSON guardado: %s", json_path)

    print(f"\n[OK] Transformacion completa: {total} registros en {len(all_records)} categorias")

    # Guardar resumen combinado
    summary_path = OUTPUT_DIR / "transform_summary.json"
    summary = {
        category: len(records)
        for category, records in all_records.items()
    }
    summary_path.write_text(
        json.dumps(summary, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"[INFO] Resumen: {json.dumps(summary, ensure_ascii=False)}")


def cmd_load(args: argparse.Namespace) -> None:
    """Carga datos transformados a SQL o Supabase API."""
    # Buscar archivos JSON transformados
    json_files = list(OUTPUT_DIR.glob("*_transformed.json"))
    if not json_files:
        print("[ERROR] No hay archivos transformados. Ejecute 'transform' primero.")
        return

    all_records: dict[str, list] = {}
    for json_file in json_files:
        category = json_file.stem.replace("_transformed", "")
        records = json.loads(json_file.read_text(encoding="utf-8"))
        all_records[category] = records
        print(f"[LOAD] Cargados {len(records)} registros de {category}")

    if args.method == "sql":
        # Generar SQL por categoría
        for category, records in all_records.items():
            path = generate_upsert_sql(records, category)
            print(f"  [SQL] SQL de {category}: {path}")

        # Generar SQL combinado
        combined_path = generate_combined_sql(all_records)
        print(f"\n[OK] SQL combinado: {combined_path}")

    elif args.method == "api":
        # Cargar vía API
        loader = SupabaseLoader()
        try:
            dry_run_result = loader.dry_run(
                [r for rs in all_records.values() for r in rs]
            )
            print(f"\n🔍 Dry run: {json.dumps(dry_run_result, indent=2, ensure_ascii=False, default=str)}")

            confirm = input("\n¿Continuar con la carga? (sí/no): ")
            if confirm.lower() not in ("sí", "si", "s", "yes", "y"):
                print("[ERROR] Carga cancelada.")
                return

            total_inserted = 0
            for category, records in all_records.items():
                inserted = loader.insert_datos(records)
                total_inserted += inserted
                print(f"  [OK] {category}: {inserted}/{len(records)} registros insertados")

            print(f"\n[OK] Total insertados: {total_inserted}")

        except ValueError as e:
            print(f"[ERROR] Error: {e}")
            print("💡 Use --method sql para generar SQL y ejecutarlo manualmente en Supabase SQL Editor.")

    else:
        print(f"[ERROR] Método no reconocido: {args.method}. Use 'sql' o 'api'.")


def cmd_etl(args: argparse.Namespace) -> None:
    """Pipeline completo: transform → load."""
    # Transform
    args_transform = argparse.Namespace(all=args.all, category=args.category)
    cmd_transform(args_transform)

    # Load
    args_load = argparse.Namespace(method=args.method or "sql")
    cmd_load(args_load)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="ETL DDNA - Pipeline de datos para el Tablero de Monitoreo",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    subparsers = parser.add_subparsers(dest="command", help="Comando a ejecutar")

    # inspect
    inspect_parser = subparsers.add_parser("inspect", help="Inspeccionar archivos de datos")
    inspect_parser.add_argument("--category", "-c", choices=VALID_CATEGORIES, help="Categoría específica")

    # transform
    transform_parser = subparsers.add_parser("transform", help="Transformar datos")
    transform_group = transform_parser.add_mutually_exclusive_group(required=True)
    transform_group.add_argument("--category", "-c", choices=VALID_CATEGORIES, help="Categoría específica")
    transform_group.add_argument("--all", "-a", action="store_true", help="Todas las categorías")

    # load
    load_parser = subparsers.add_parser("load", help="Cargar datos")
    load_parser.add_argument("--method", "-m", choices=["sql", "api"], default="sql", help="Método de carga")

    # etl (pipeline completo)
    etl_parser = subparsers.add_parser("etl", help="Pipeline completo ETL")
    etl_group = etl_parser.add_mutually_exclusive_group(required=True)
    etl_group.add_argument("--category", "-c", choices=VALID_CATEGORIES, help="Categoría específica")
    etl_group.add_argument("--all", "-a", action="store_true", help="Todas las categorías")
    etl_parser.add_argument("--method", "-m", choices=["sql", "api"], default="sql", help="Método de carga")

    args = parser.parse_args()

    if args.command == "inspect":
        cmd_inspect(args)
    elif args.command == "transform":
        cmd_transform(args)
    elif args.command == "load":
        cmd_load(args)
    elif args.command == "etl":
        cmd_etl(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()