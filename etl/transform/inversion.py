"""
Transformacion de datos de inversion social.
"""
import json
import logging
from pathlib import Path
from typing import Any

import pandas as pd

from etl.extract import read_excel, clean_column_names, find_data_files, read_excel_file
from etl.config import DATA_FILES

logger = logging.getLogger(__name__)


def transform_inversion() -> list[dict[str, Any]]:
    """
    Transforma los archivos de inversion social en registros de datos_indicadores.

    Retorna lista de dicts con: indicador_nombre, categoria, valor, periodo, region, desglose, unidad.
    """
    files = find_data_files("inversion", DATA_FILES)
    if not files:
        logger.warning("No se encontraron archivos de datos para inversion")
        return []

    records: list[dict[str, Any]] = []

    for filepath in files:
        logger.info("Procesando archivo de inversion: %s", filepath.name)

        try:
            sheets = read_excel_file(filepath)
        except Exception as exc:
            logger.error("Error leyendo %s: %s", filepath.name, exc)
            continue

        for sheet_name, df in sheets.items():
            df = clean_column_names(df)
            df = df.dropna(how="all")

            if df.empty:
                continue

            # Transformar datos de inversion
            records.extend(_transform_inversion(df, filepath.name, sheet_name))

    logger.info("Transformacion de inversion completa: %d registros", len(records))
    return records


def _transform_inversion(df, filename, sheet_name):
    """Transforma un DataFrame de inversion."""
    records = []

    # Buscar columnas relevantes
    cols = list(df.columns)
    logger.info("Columnas en %s / %s: %s", filename, sheet_name, cols)

    # Buscar columnas de año/ejercicio, concepto, monto, etc.
    # Normalizar nombres de columnas
    col_map = {}
    for col in cols:
        col_lower = col.lower().strip()
        if any(kw in col_lower for kw in ["ejercicio", "año", "year", "periodo"]):
            col_map["periodo"] = col
        elif any(kw in col_lower for kw in ["concepto", "descripcion", "programa", "jurisdiccion"]):
            col_map["concepto"] = col
        elif any(kw in col_lower for kw in ["monto", "importe", "monto ejecutado", "presupuesto", "monto inicial"]):
            col_map["monto"] = col
        elif any(kw in col_lower for kw in [" Areas", "area", "secretaria", "area"]):
            col_map["area"] = col
        elif any(kw in col_lower for kw in ["destino", "poblacion", "niños", "nna", "infancia"]):
            col_map["destino"] = col

    periodo_col = col_map.get("periodo")
    concepto_col = col_map.get("concepto")
    monto_col = col_map.get("monto")
    area_col = col_map.get("area")

    if not monto_col:
        logger.warning("No se encontro columna de monto en %s / %s", filename, sheet_name)
        # Intentar procesar como tabla simple
        for _, row in df.iterrows():
            if row.isna().all():
                continue
            # Tomar primera columna como indicador, segunda como valor
            vals = [v for v in row.values if pd.notna(v)]
            if len(vals) >= 2:
                records.append({
                    "indicador_nombre": str(vals[0])[:100],
                    "categoria": "inversion",
                    "valor": _extract_number(vals[1]),
                    "periodo": "2024",
                    "region": "Córdoba",
                    "unidad": "Md",
                    "desglose": "{}",
                })
        return records

    # Procesar como tabla de inversion estructurada
    for _, row in df.iterrows():
        if row.isna().all():
            continue

        periodo = str(row.get(periodo_col, "2024")) if periodo_col else "2024"
        concepto = str(row.get(concepto_col)) if concepto_col else "Inversion social"
        monto = _extract_number(row.get(monto_col)) if monto_col else 0

        if monto is None or monto == 0:
            continue

        desglose = {}
        if area_col:
            desglose["area"] = str(row.get(area_col))
        if concepto_col:
            desglose["concepto"] = str(row.get(concepto_col))

        records.append({
            "indicador_nombre": "Inversion social en infancia",
            "categoria": "inversion",
            "valor": monto,
            "periodo": str(periodo)[:4],
            "region": "Córdoba",
            "unidad": "Md",
            "desglose": json.dumps(desglose),
        })

    return records


def _extract_number(val):
    """Extrae un numero de various formatos."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None

    if isinstance(val, (int, float)):
        return float(val)

    # String: remover simbolos de moneda, espacios, etc.
    val_str = str(val).strip()
    val_str = val_str.replace("$", "").replace(".", "").replace(",", ".").replace(" ", "")

    try:
        return float(val_str)
    except ValueError:
        return None