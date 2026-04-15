"""
Transformación de datos de salud (DEIS, mortalidad infantil, cobertura vacunal).
"""
import json
import logging
from pathlib import Path
from typing import Any

import pandas as pd

from etl.extract import read_excel, clean_column_names, find_data_files
from etl.config import DATA_FILES

logger = logging.getLogger(__name__)


def transform_salud() -> list[dict[str, Any]]:
    """
    Transforma los archivos de salud en registros de datos_indicadores.

    Retorna lista de dicts con: indicador_nombre, categoria, valor, periodo, region, desglose, unidad.
    """
    files = find_data_files("salud", DATA_FILES)
    if not files:
        logger.warning("No se encontraron archivos de datos para salud")
        return []

    records: list[dict[str, Any]] = []

    for filepath in files:
        logger.info("Procesando archivo de salud: %s", filepath.name)

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

            # Detectar tipo de datos por nombre de archivo y hoja
            name_lower = filepath.name.lower()

            if "mortalidad" in name_lower or "infantil" in name_lower:
                records.extend(_transform_mortalidad(df, filepath.name, sheet_name))
            elif "cobertura" in name_lower or "salud" in name_lower or "vacunal" in name_lower:
                records.extend(_transform_cobertura(df, filepath.name, sheet_name))
            elif "deis" in name_lower or "datos" in name_lower:
                records.extend(_transform_deis_general(df, filepath.name, sheet_name))
            elif "madre" in name_lower or "edad" in name_lower:
                records.extend(_transform_edad_madre(df, filepath.name, sheet_name))
            else:
                logger.warning(
                    "Tipo de datos no reconocido en %s / hoja %s. Columnas: %s",
                    filepath.name, sheet_name, list(df.columns),
                )

    return records


def _detect_year_column(df: pd.DataFrame) -> str | None:
    """Busca una columna que parezca contener años."""
    for col in df.columns:
        col_str = str(col).lower()
        if any(kw in col_str for kw in ["anio", "año", "year", "periodo"]):
            return col
        # Si los valores son numéricos tipo año (1900-2100)
        try:
            sample = df[col].dropna().head(5)
            if all(1900 <= int(v) <= 2100 for v in sample):
                return col
        except (ValueError, TypeError):
            continue
    return None


def _extract_years_from_columns(df: pd.DataFrame) -> list[str]:
    """Extrae años de los nombres de columnas si son numéricos (ej: '2018', '2019')."""
    years: list[str] = []
    for col in df.columns:
        try:
            year = int(str(col).strip())
            if 1990 <= year <= 2100:
                years.append(str(year))
        except (ValueError, TypeError):
            continue
    return years


def _transform_mortalidad(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transforma datos de mortalidad infantil."""
    records: list[dict[str, Any]] = []
    years_in_cols = _extract_years_from_columns(df)

    # Buscar columna de provincia/región
    region_col: str | None = None
    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["provincia", "region", "jurisdiccion"]):
            region_col = col
            break

    if years_in_cols and region_col:
        # Formato: filas=regiones, columnas=años
        for _, row in df.iterrows():
            region_val = str(row[region_col]).strip()
            if "córdoba" in region_val.lower() or "total" in region_val.lower():
                for year_col in years_in_cols:
                    valor = row.get(year_col)
                    if pd.notna(valor):
                        try:
                            valor_float = float(valor)
                        except (ValueError, TypeError):
                            continue
                        records.append({
                            "indicador_nombre": "Mortalidad infantil",
                            "categoria": "salud",
                            "valor": valor_float,
                            "periodo": year_col,
                            "region": "Córdoba" if "córdoba" in region_val.lower() else region_val,
                            "desglose": json.dumps({"fuente": filename, "hoja": sheet}),
                            "unidad": "‰",
                        })
    else:
        # Formato alternativo: buscar año en columna y valor en otra
        year_col = _detect_year_column(df)
        exclude = [region_col] if region_col else []
        if year_col:
            exclude.append(year_col)
        value_cols = [c for c in df.columns if c not in exclude]

        if year_col:
            for _, row in df.iterrows():
                periodo = str(row[year_col]) if pd.notna(row[year_col]) else None
                if periodo is None:
                    continue
                for vc in value_cols:
                    valor = row.get(vc)
                    if pd.notna(valor):
                        try:
                            valor_float = float(valor)
                        except (ValueError, TypeError):
                            continue
                        records.append({
                            "indicador_nombre": "Mortalidad infantil",
                            "categoria": "salud",
                            "valor": valor_float,
                            "periodo": periodo,
                            "region": "Córdoba",
                            "desglose": json.dumps({
                                "serie": str(vc),
                                "fuente": filename,
                                "hoja": sheet,
                            }),
                            "unidad": "‰",
                        })

    return records


def _transform_cobertura(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transforma datos de cobertura de salud / vacunación."""
    records: list[dict[str, Any]] = []
    years_in_cols = _extract_years_from_columns(df)

    # Buscar columna de vacuna o tipo de cobertura
    label_col: str | None = None
    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["vacuna", "tipo", "cobertura", "indicador", "descripcion"]):
            label_col = col
            break

    if label_col and years_in_cols:
        for _, row in df.iterrows():
            label = str(row[label_col]).strip() if pd.notna(row[label_col]) else ""
            for year in years_in_cols:
                valor = row.get(year)
                if pd.notna(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    records.append({
                        "indicador_nombre": "Cobertura vacunal",
                        "categoria": "salud",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps({
                            "vacuna": label,
                            "fuente": filename,
                            "hoja": sheet,
                        }),
                        "unidad": "%",
                    })

    return records


def _transform_deis_general(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transforma datos generales del DEIS."""
    records: list[dict[str, Any]] = []

    # Intentar detectar la estructura de forma genérica
    years_in_cols = _extract_years_from_columns(df)
    year_col = _detect_year_column(df)

    # Buscar columnas de etiquetas
    label_cols: list[str] = []
    for col in df.columns:
        col_str = str(col).lower()
        if any(kw in col_str for kw in ["causa", "descripcion", "tipo", "grupo", "categoria", "indicador"]):
            label_cols.append(col)

    if years_in_cols and label_cols:
        for _, row in df.iterrows():
            labels = {lc: str(row[lc]) for lc in label_cols if pd.notna(row[lc])}
            for year in years_in_cols:
                valor = row.get(year)
                if pd.notna(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    desglose = {"fuente": filename, "hoja": sheet}
                    desglose.update(labels)
                    records.append({
                        "indicador_nombre": "Indicador de salud",
                        "categoria": "salud",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps(desglose),
                        "unidad": "casos",
                    })

    return records


def _transform_edad_madre(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transforma datos de edad de la madre."""
    records: list[dict[str, Any]] = []
    years_in_cols = _extract_years_from_columns(df)

    # Buscar columna de grupo etario
    age_col: str | None = None
    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["edad", "grupo", "rango"]):
            age_col = col
            break

    if age_col and years_in_cols:
        for _, row in df.iterrows():
            grupo = str(row[age_col]).strip() if pd.notna(row[age_col]) else ""
            for year in years_in_cols:
                valor = row.get(year)
                if pd.notna(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue
                    records.append({
                        "indicador_nombre": "Nacimientos por edad de la madre",
                        "categoria": "salud",
                        "valor": valor_float,
                        "periodo": year,
                        "region": "Córdoba",
                        "desglose": json.dumps({
                            "grupo_etario": grupo,
                            "fuente": filename,
                            "hoja": sheet,
                        }),
                        "unidad": "casos",
                    })

    return records