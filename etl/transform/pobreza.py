"""
Transformación de datos de pobreza (INDEC, encuestas).
"""
import json
import logging
from typing import Any

import pandas as pd

from etl.extract import read_excel_file, clean_column_names, find_data_files
from etl.config import DATA_FILES

logger = logging.getLogger(__name__)


def transform_pobreza() -> list[dict[str, Any]]:
    """Transforma los archivos de pobreza."""
    files = find_data_files("pobreza", DATA_FILES)
    if not files:
        logger.warning("No se encontraron archivos de datos para pobreza")
        return []

    records: list[dict[str, Any]] = []

    for filepath in files:
        logger.info("Procesando archivo de pobreza: %s", filepath.name)
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

            name_lower = filepath.name.lower()
            if "informe" in name_lower or "pobreza" in name_lower:
                records.extend(_transform_pobreza_indicadores(df, filepath.name, sheet_name))
            elif "encoprac" in name_lower:
                records.extend(_transform_encoprac(df, filepath.name, sheet_name))
            else:
                records.extend(_transform_generico(df, filepath.name, sheet_name))

    return records


def _extract_years_from_columns(df: pd.DataFrame) -> dict[str, str]:
    """Extrae años de los nombres de columnas.

    Retorna dict {año: nombre_columna} para poder obtener valores con row.get().

    Maneja dos formatos:
    - Año directo: "2016", "2017" -> {"2016": "2016", ...}
    - Semestre: "2do. semestre 2016", "1er. semestre 2017" -> {"2016": "2do. semestre 2016", ...}
    """
    import re
    year_to_col: dict[str, str] = {}
    for col in df.columns:
        col_str = str(col).strip()
        # Buscar año de 4 dígitos en cualquier posición
        match = re.search(r'(\d{4})', col_str)
        if match:
            year = match.group(1)
            if 1990 <= int(year) <= 2100 and year not in year_to_col:
                year_to_col[year] = col_str
    return year_to_col


def _transform_pobreza_indicadores(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transforma datos de pobreza e indigencia del INDEC."""
    records: list[dict[str, Any]] = []
    year_to_col = _extract_years_from_columns(df)

    # Buscar columna de región o tipo de dato
    label_col: str | None = None
    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["region", "tipo", "indicador", "pobreza", "indigencia", "descripcion"]):
            label_col = col
            break

    # Si no hay columna de label, buscar la primera columna no-numérica
    if not label_col:
        for col in df.columns:
            if col not in year_to_col.values() and df[col].dtype == object:
                label_col = col
                break

    if label_col and year_to_col:
        for _, row in df.iterrows():
            label = str(row[label_col]).strip() if pd.notna(row[label_col]) else ""
            es_pobreza = "pobreza" in label.lower() and "indigencia" not in label.lower()
            es_indigencia = "indigencia" in label.lower()
            nombre_indicador = "Pobreza infantil" if es_pobreza else ("Indigencia infantil" if es_indigencia else label)

            for year, col_name in year_to_col.items():
                valor = row.get(col_name)
                if pd.notna(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    records.append({
                        "indicador_nombre": nombre_indicador or "Indicador de pobreza",
                        "categoria": "pobreza",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps({
                            "tipo": label,
                            "fuente": filename,
                            "hoja": sheet,
                        }),
                        "unidad": "%",
                    })

    return records


def _transform_encoprac(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transforma datos de encuestas de consumo (ENCOPRAC)."""
    records: list[dict[str, Any]] = []
    year_to_col = _extract_years_from_columns(df)

    label_col: str | None = None
    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["categoria", "tipo", "grupo", "descripcion", "variable"]):
            label_col = col
            break

    if label_col and year_to_col:
        for _, row in df.iterrows():
            label = str(row[label_col]).strip() if pd.notna(row[label_col]) else ""
            for year, col_name in year_to_col.items():
                valor = row.get(col_name)
                if pd.notna(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    records.append({
                        "indicador_nombre": label or "Indicador de consumo",
                        "categoria": "pobreza",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps({"fuente": filename, "hoja": sheet}),
                        "unidad": "%",
                    })

    return records


def _transform_generico(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transformación genérica para datos de pobreza."""
    records: list[dict[str, Any]] = []
    year_to_col = _extract_years_from_columns(df)

    if not year_to_col:
        return records

    # Tomar primera columna no-numérica como label
    label_col: str | None = None
    for col in df.columns:
        if col not in year_to_col.values() and df[col].dtype == object:
            label_col = col
            break

    if label_col:
        for _, row in df.iterrows():
            label = str(row[label_col]).strip() if pd.notna(row[label_col]) else ""
            for year, col_name in year_to_col.items():
                valor = row.get(col_name)
                if pd.notna(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    records.append({
                        "indicador_nombre": label or "Indicador de pobreza",
                        "categoria": "pobreza",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps({"fuente": filename, "hoja": sheet}),
                        "unidad": "%",
                    })

    return records