"""
Transformación de datos demográficos (Censo 2022).
"""
import json
import logging
from typing import Any

import pandas as pd

from extract.read_excel import read_excel_file, clean_column_names, find_data_files
from config import DATA_FILES

logger = logging.getLogger(__name__)


def transform_demografia() -> list[dict[str, Any]]:
    """Transforma los archivos demográficos (censo)."""
    files = find_data_files("demografia", DATA_FILES)
    if not files:
        logger.warning("No se encontraron archivos de datos para demografía")
        return []

    records: list[dict[str, Any]] = []

    for filepath in files:
        logger.info("Procesando archivo demográfico: %s", filepath.name)
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
            records.extend(_transform_censo(df, filepath.name, sheet_name))

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


def _transform_censo(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transforma datos del censo poblacional."""
    records: list[dict[str, Any]] = []
    years = _extract_years_from_columns(df)

    # Buscar columnas de etiquetas (grupo etario, sexo, etc.)
    label_cols: list[str] = []
    for col in df.columns:
        if col in years:
            continue
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in [
            "edad", "grupo", "rango", "sexo", "tramo",
            "categoria", "tipo", "descripcion", "variable",
            "jurisdiccion", "provincia", "region",
        ]):
            label_cols.append(col)

    # Si no encontramos labels, usar la primera columna no-numérica
    if not label_cols:
        for col in df.columns:
            if col not in years and df[col].dtype == object:
                label_cols.append(col)
                break

    if label_cols and years:
        for _, row in df.iterrows():
            labels = {lc: str(row[lc]) for lc in label_cols if pd.notna(row[lc])}
            # Filtrar solo filas de Córdoba si existe columna de jurisdicción
            region_val = ""
            for lc in label_cols:
                lc_lower = lc.lower()
                if any(kw in lc_lower for kw in ["jurisdiccion", "provincia", "region"]):
                    region_val = str(row[lc])
                    break

            # Priorizar filas de Córdoba
            if region_val and "córdoba" not in region_val.lower() and "total" not in region_val.lower():
                continue

            for year in years:
                valor = row.get(year)
                if pd.notna(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    desglose = {"fuente": filename, "hoja": sheet}
                    desglose.update(labels)
                    records.append({
                        "indicador_nombre": "Población por grupo",
                        "categoria": "demografia",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba" if "córdoba" in region_val.lower() else region_val or "Córdoba",
                        "desglose": json.dumps(desglose),
                        "unidad": "hab",
                    })
    elif years:
        # Sin labels, cada columna de año es un total
        for year in years:
            if year in df.columns:
                total = pd.to_numeric(df[year], errors="coerce").sum()
                if pd.notna(total) and total > 0:
                    records.append({
                        "indicador_nombre": "Población total",
                        "categoria": "demografia",
                        "valor": float(total),
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps({"fuente": filename, "hoja": sheet}),
                        "unidad": "hab",
                    })

    return records