"""
Transformación de datos de seguridad/justicia.
"""
import json
import logging
from typing import Any

import pandas as pd

from extract.read_excel import read_excel_file, clean_column_names, find_data_files
from config import DATA_FILES

logger = logging.getLogger(__name__)


def transform_seguridad() -> list[dict[str, Any]]:
    """Transforma los archivos de seguridad/justicia."""
    files = find_data_files("seguridad", DATA_FILES)
    if not files:
        logger.warning("No se encontraron archivos de datos para seguridad")
        return []

    records: list[dict[str, Any]] = []

    for filepath in files:
        logger.info("Procesando archivo de seguridad: %s", filepath.name)
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

            records.extend(_transform_justicia(df, filepath.name, sheet_name))

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


def _transform_justicia(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transforma datos de justicia/delincuencia."""
    records: list[dict[str, Any]] = []
    years = _extract_years_from_columns(df)

    # Buscar columna de tipo de delito o categoría
    label_col: str | None = None
    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["tipo", "delito", "categoria", "descripcion", "indicador", "variable"]):
            label_col = col
            break

    # Si no encontramos label, usar primera columna no-numérica
    if not label_col:
        for col in df.columns:
            if col not in years and df[col].dtype == object:
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
                        "indicador_nombre": label or "Denuncias registradas",
                        "categoria": "seguridad",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps({
                            "tipo": label,
                            "fuente": filename,
                            "hoja": sheet,
                        }),
                        "unidad": "casos",
                    })
    elif years:
        # Si no hay columna de label, cada columna de año es un indicador
        for year in years:
            valor = df[year].sum() if year in df.columns else None
            if pd.notna(valor):
                try:
                    valor_float = float(valor)
                except (ValueError, TypeError):
                    continue
                records.append({
                    "indicador_nombre": "Denuncias registradas",
                    "categoria": "seguridad",
                    "valor": valor_float,
                    "periodo": year,
                    "region": "Córdoba",
                    "desglose": json.dumps({"fuente": filename, "hoja": sheet}),
                    "unidad": "casos",
                })

    return records