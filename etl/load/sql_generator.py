"""
Generador de SQL UPSERT para datos de indicadores DDNA.

Genera archivos SQL con sentencias INSERT ... ON CONFLICT DO UPDATE
que se pueden ejecutar en el SQL Editor de Supabase.
"""
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from config import OUTPUT_DIR

# ── Indicadores seed conocidos ──
# Para lookups por nombre+categoria en lugar de UUIDs hardcodeados
SEED_INDICADORES: list[dict[str, str]] = [
    {"nombre": "Pobreza infantil", "categoria": "pobreza", "unidad": "%"},
    {"nombre": "Mortalidad infantil", "categoria": "salud", "unidad": "‰"},
    {"nombre": "Tasa neta de escolarización", "categoria": "educacion", "unidad": "%"},
    {"nombre": "Inversión social en infancia", "categoria": "inversion", "unidad": "Md"},
    {"nombre": "Población adolescente", "categoria": "demografia", "unidad": "hab"},
    {"nombre": "Denuncias registradas", "categoria": "seguridad", "unidad": "casos"},
    {"nombre": "Cobertura vacunal", "categoria": "salud", "unidad": "%"},
    {"nombre": "Abandono escolar", "categoria": "educacion", "unidad": "%"},
    {"nombre": "Indigencia infantil", "categoria": "pobreza", "unidad": "%"},
    {"nombre": "Nacimientos por edad de la madre", "categoria": "salud", "unidad": "casos"},
    {"nombre": "Escolarización por nivel", "categoria": "educacion", "unidad": "%"},
]


def generate_upsert_sql(
    records: list[dict[str, Any]],
    category: str,
    output_dir: Path | None = None,
) -> Path:
    """
    Genera un archivo SQL con sentencias UPSERT para los registros dados.

    Primero asegura que los indicadores existen, luego inserta los datos.
    Usa UUIDs deterministas basados en nombre+categoria para evitar duplicados.
    """
    if output_dir is None:
        output_dir = OUTPUT_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = output_dir / f"{category}_{timestamp}.sql"

    # Recopilar indicadores únicos de los registros
    indicadores_unicos: dict[str, dict[str, str]] = {}
    for rec in records:
        key = f"{rec['categoria']}:{rec['indicador_nombre']}"
        if key not in indicadores_unicos:
            indicadores_unicos[key] = {
                "nombre": rec["indicador_nombre"],
                "categoria": rec["categoria"],
                "unidad": rec.get("unidad", "%"),
            }

    lines: list[str] = []
    lines.append(f"-- ============================================================")
    lines.append(f"-- ETL DDNA: Datos de {category}")
    lines.append(f"-- Generado: {datetime.now().isoformat()}")
    lines.append(f"-- Registros: {len(records)}")
    lines.append(f"-- ============================================================")
    lines.append("")

    # ── 1. Asegurar indicadores ──
    if indicadores_unicos:
        lines.append("-- Asegurar que los indicadores existen")
        for key, ind in indicadores_unicos.items():
            ind_id = _deterministic_uuid(ind["nombre"], ind["categoria"])
            nom = ind["nombre"]
            cat = ind["categoria"]
            desc = f"Datos de {nom}"
            lines.append(
                f"INSERT INTO indicadores (id, categoria, nombre, descripcion, unidad, frecuencia_actualizacion, orden, activo)\n"
                f"VALUES ('{ind_id}', '{cat}', {sql_escape(nom)}, {sql_escape(desc)}, {sql_escape(ind['unidad'])}, 'anual', 0, true)\n"
                f"ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, unidad = EXCLUDED.unidad;"
            )
            lines.append("")

    # ── 2. Insertar datos ──
    lines.append(f"-- Datos de indicadores ({len(records)} registros)")
    for rec in records:
        ind_id = _deterministic_uuid(rec["indicador_nombre"], rec["categoria"])
        dato_id = _deterministic_uuid(
            f"{rec['indicador_nombre']}:{rec['categoria']}:{rec['periodo']}:{rec['region']}"
        )
        desglose = rec.get("desglose", "{}")
        if isinstance(desglose, dict):
            desglose = json.dumps(desglose)

        lines.append(
            f"INSERT INTO datos_indicadores (id, indicador_id, valor, periodo, region, desglose)\n"
            f"VALUES ('{dato_id}', '{ind_id}', {rec['valor']}, {sql_escape(rec['periodo'])}, {sql_escape(rec['region'])}, {sql_escape(desglose)}::jsonb)\n"
            f"ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;"
        )
        lines.append("")

    # Escribir archivo
    content = "\n".join(lines)
    filepath.write_text(content, encoding="utf-8")
    print(f"[OK] SQL generado: {filepath} ({len(records)} registros, {len(indicadores_unicos)} indicadores)")

    return filepath


def generate_combined_sql(
    all_records: dict[str, list[dict[str, Any]]],
    output_dir: Path | None = None,
) -> Path:
    """Genera un archivo SQL combinado con todas las categorías."""
    if output_dir is None:
        output_dir = OUTPUT_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = output_dir / f"ddna_all_data_{timestamp}.sql"

    all_records_flat: list[dict[str, Any]] = []
    for category_records in all_records.values():
        all_records_flat.extend(category_records)

    # Recopilar indicadores únicos
    indicadores_unicos: dict[str, dict[str, str]] = {}
    for rec in all_records_flat:
        key = f"{rec['categoria']}:{rec['indicador_nombre']}"
        if key not in indicadores_unicos:
            indicadores_unicos[key] = {
                "nombre": rec["indicador_nombre"],
                "categoria": rec["categoria"],
                "unidad": rec.get("unidad", "%"),
            }

    lines: list[str] = []
    lines.append("-- ============================================================")
    lines.append("-- ETL DDNA: Datos combinados de todas las categorías")
    lines.append(f"-- Generado: {datetime.now().isoformat()}")
    lines.append(f"-- Total registros: {len(all_records_flat)}")
    lines.append(f"-- Categorías: {', '.join(all_records.keys())}")
    lines.append("-- ============================================================")
    lines.append("")

    # Indicadores
    lines.append("-- ============================================================")
    lines.append("-- INDICADORES")
    lines.append("-- ============================================================")
    for key, ind in indicadores_unicos.items():
        ind_id = _deterministic_uuid(ind["nombre"], ind["categoria"])
        nombre = ind["nombre"]
        categoria = ind["categoria"]
        descripcion = f"Datos de {nombre}"
        lines.append(
            f"INSERT INTO indicadores (id, categoria, nombre, descripcion, unidad, frecuencia_actualizacion, orden, activo)\n"
            f"VALUES ('{ind_id}', '{categoria}', {sql_escape(nombre)}, {sql_escape(descripcion)}, {sql_escape(ind['unidad'])}, 'anual', 0, true)\n"
            f"ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, unidad = EXCLUDED.unidad;"
        )
        lines.append("")

    # Datos por categoría
    for category, records in all_records.items():
        lines.append("")
        lines.append(f"-- ============================================================")
        lines.append(f"-- DATOS: {category.upper()} ({len(records)} registros)")
        lines.append("-- ============================================================")
        for rec in records:
            ind_nombre = rec["indicador_nombre"]
            cat = rec["categoria"]
            periodo = rec["periodo"]
            region = rec["region"]
            valor = rec["valor"]
            ind_id = _deterministic_uuid(ind_nombre, cat)
            dato_id = _deterministic_uuid(f"{ind_nombre}:{cat}:{periodo}:{region}")
            desglose = rec.get("desglose", "{}")
            if isinstance(desglose, dict):
                desglose = json.dumps(desglose)

            desglose_escaped = sql_escape(desglose)
            lines.append(
                f"INSERT INTO datos_indicadores (id, indicador_id, valor, periodo, region, desglose)\n"
                f"VALUES ('{dato_id}', '{ind_id}', {valor}, {sql_escape(periodo)}, {sql_escape(region)}, {desglose_escaped}::jsonb)\n"
                f"ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;"
            )
            lines.append("")

    content = "\n".join(lines)
    filepath.write_text(content, encoding="utf-8")
    print(f"[OK] SQL combinado generado: {filepath} ({len(all_records_flat)} registros totales)")
    return filepath


def _deterministic_uuid(*args: str) -> str:
    """Genera un UUID5 determinista a partir de strings para IDs reproducibles."""
    import hashlib
    namespace = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")  # URL namespace
    combined = "|".join(str(a) for a in args)
    return str(uuid.uuid5(namespace, combined))


def sql_escape(value: str) -> str:
    """Escapa un string para SQL (single quotes)."""
    escaped = value.replace("'", "''")
    return f"'{escaped}'"