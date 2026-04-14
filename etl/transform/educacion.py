"""
Transformación de datos educativos (Aprender, Censo 2022).
"""
import json
import logging
from typing import Any

import pandas as pd

from extract.read_excel import read_excel_file, clean_column_names, find_data_files
from config import DATA_FILES

logger = logging.getLogger(__name__)


def transform_educacion() -> list[dict[str, Any]]:
    """Transforma los archivos de educación."""
    files = find_data_files("educacion", DATA_FILES)
    if not files:
        logger.warning("No se encontraron archivos de datos para educación")
        return []

    records: list[dict[str, Any]] = []

    for filepath in files:
        logger.info("Procesando archivo de educación: %s", filepath.name)
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
            if "nivel" in name_lower:
                records.extend(_transform_por_nivel(df, filepath.name, sheet_name))
            elif "edad" in name_lower or "edades" in name_lower:
                records.extend(_transform_por_edad(df, filepath.name, sheet_name))
            else:
                records.extend(_transform_generico(df, filepath.name, sheet_name))

    return records


def _extract_years_from_columns(df: pd.DataFrame) -> list[str]:
    """Extrae años de los nombres de columnas."""
    years: list[str] = []
    for col in df.columns:
        try:
            year = int(str(col).strip())
            if 1990 <= year <= 2100:
                years.append(str(year))
        except (ValueError, TypeError):
            continue
    return years


def _transform_por_nivel(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Educación por nivel (primario, secundario, etc.)."""
    records: list[dict[str, Any]] = []
    years = _extract_years_from_columns(df)

    level_col: str | None = None
    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["nivel", "tipo", "modalidad", "categoria"]):
            level_col = col
            break

    if level_col and years:
        for _, row in df.iterrows():
            nivel = str(row[level_col]).strip() if pd.notna(row[level_col]) else ""
            for year in years:
                valor = row.get(year)
                if pd.notna(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    records.append({
                        "indicador_nombre": "Escolarización por nivel",
                        "categoria": "educacion",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps({
                            "nivel_educativo": nivel,
                            "fuente": filename,
                            "hoja": sheet,
                        }),
                        "unidad": "%",
                    })

    return records


def _transform_por_edad(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Educación por grupo etario."""
    records: list[dict[str, Any]] = []
    years = _extract_years_from_columns(df)

    age_col: str | None = None
    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["edad", "grupo", "rango", "tramo"]):
            age_col = col
            break

    if age_col and years:
        for _, row in df.iterrows():
            grupo = str(row[age_col]).strip() if pd.notna(row[age_col]) else ""
            for year in years:
                valor = row.get(year)
                if pd.notna(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    records.append({
                        "indicador_nombre": "Escolarización por edad",
                        "categoria": "educacion",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps({
                            "grupo_etario": grupo,
                            "fuente": filename,
                            "hoja": sheet,
                        }),
                        "unidad": "%",
                    })

    return records


def _transform_generico(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transformación genérica para datos educativos."""
    records: list[dict[str, Any]] = []
    years = _extract_years_from_columns(df)

    # Buscar columna de etiquetas
    label_col: str | None = None
    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["indicador", "descripcion", "tipo", "categoria", "variable"]):
            label_col = col
            break

    if label_col and years:
        for _, row in df.iterrows():
            label = str(row[label_col]).strip() if pd.notna(row[label_col]) else ""
            for year in years:
                valor = row.get(year)
                if pd.notna(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    records.append({
                        "indicador_nombre": label or "Indicador educativo",
                        "categoria": "educacion",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps({"fuente": filename, "hoja": sheet}),
                        "unidad": "%",
                    })

    return records