"""
Transformación de datos demográficos.

Procesa:
- censo poblacion.xlsx: Población por edad (Censo 2022)
- Edad_Madre 2022.xlsx: Nacimientos por edad de la madre
- datosDeis-2024-07-26 (3).xlsx: Nacidos vivos registrados por año
"""
import json
import logging
from pathlib import Path
from typing import Any

import pandas as pd

from etl.extract import read_excel_file, clean_column_names
from etl.config import DATA_FILES, RAW_DATA_DIR

logger = logging.getLogger(__name__)


def transform_demografia() -> list[dict[str, Any]]:
    """Transforma los archivos demográficos."""
    records: list[dict[str, Any]] = []

    # Procesar cada archivo demográfico
    demografia_files = DATA_FILES.get("demografia", [])

    for filepath in demografia_files:
        if not filepath.exists():
            logger.warning("Archivo no encontrado: %s", filepath)
            continue

        logger.info("Procesando archivo demográfico: %s", filepath.name)

        try:
            if "censo poblacion" in filepath.name.lower():
                records.extend(_transform_censo_poblacion(filepath))
            elif "edad_madre" in filepath.name.lower():
                records.extend(_transform_edad_madre(filepath))
            elif "datosdeis" in filepath.name.lower():
                records.extend(_transform_nacidos_vivos(filepath))
            else:
                logger.warning("Archivo no reconocido: %s", filepath.name)
        except Exception as exc:
            logger.error("Error procesando %s: %s", filepath.name, exc)
            continue

    logger.info("Total registros demografía: %d", len(records))
    return records


def _transform_censo_poblacion(filepath: Path) -> list[dict[str, Any]]:
    """Transforma datos del censo poblacional por edad."""
    records: list[dict[str, Any]] = []
    sheets = read_excel_file(filepath)

    for sheet_name, df in sheets.items():
        if sheet_name.lower() in ["descripción", "notas"]:
            continue

        df = clean_column_names(df)
        df = df.dropna(how="all")

        if df.empty:
            continue

        logger.info("Procesando hoja: %s (%d filas)", sheet_name, len(df))

        # Hoja Censo_cba: población por edad individual
        if "cba" in sheet_name.lower() or "censo_cba" in sheet_name.lower():
            records.extend(_process_censo_cba(df, filepath.name, sheet_name))
        # Hoja censo_agrupado: población por grupos etarios
        elif "agrupado" in sheet_name.lower():
            records.extend(_process_censo_agrupado(df, filepath.name, sheet_name))
        # Hoja Totales nacion: datos nacionales (opcional)
        elif "nacion" in sheet_name.lower():
            records.extend(_process_censo_nacional(df, filepath.name, sheet_name))

    return records


def _process_censo_cba(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Procesa hoja Censo_cba: población por edad individual (0-99)."""
    records: list[dict[str, Any]] = []

    # Detectar columnas
    edad_col = None
    total_col = None
    mujer_col = None
    varon_col = None

    for col in df.columns:
        col_lower = str(col).lower()
        if "edad" in col_lower:
            edad_col = col
        elif "total" in col_lower and "poblaci" in col_lower:
            total_col = col
        elif "mujer" in col_lower or "femenino" in col_lower:
            mujer_col = col
        elif "varon" in col_lower or "masculino" in col_lower:
            varon_col = col

    if not edad_col or not total_col:
        logger.warning("Columnas no encontradas en Censo_cba")
        return records

    # Procesar cada fila (cada edad)
    for _, row in df.iterrows():
        edad = row.get(edad_col)
        if pd.isna(edad):
            continue

        edad_str = str(int(edad)) if isinstance(edad, (int, float)) else str(edad)

        # Total población
        total_val = row.get(total_col)
        if pd.notna(total_val):
            try:
                valor = float(total_val)
                records.append({
                    "indicador_nombre": "Población por edad",
                    "categoria": "demografia",
                    "valor": valor,
                    "periodo": "2022",
                    "region": "Córdoba",
                    "desglose": json.dumps({
                        "fuente": filename,
                        "hoja": sheet,
                        "edad": edad_str,
                        "sexo": "total",
                    }),
                    "unidad": "hab",
                })
            except (ValueError, TypeError):
                pass

        # Mujeres
        if mujer_col and pd.notna(row.get(mujer_col)):
            try:
                valor = float(row[mujer_col])
                records.append({
                    "indicador_nombre": "Población por edad",
                    "categoria": "demografia",
                    "valor": valor,
                    "periodo": "2022",
                    "region": "Córdoba",
                    "desglose": json.dumps({
                        "fuente": filename,
                        "hoja": sheet,
                        "edad": edad_str,
                        "sexo": "femenino",
                    }),
                    "unidad": "hab",
                })
            except (ValueError, TypeError):
                pass

        # Varones
        if varon_col and pd.notna(row.get(varon_col)):
            try:
                valor = float(row[varon_col])
                records.append({
                    "indicador_nombre": "Población por edad",
                    "categoria": "demografia",
                    "valor": valor,
                    "periodo": "2022",
                    "region": "Córdoba",
                    "desglose": json.dumps({
                        "fuente": filename,
                        "hoja": sheet,
                        "edad": edad_str,
                        "sexo": "masculino",
                    }),
                    "unidad": "hab",
                })
            except (ValueError, TypeError):
                pass

    return records


def _process_censo_agrupado(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Procesa hoja censo_agrupado: población por grupos etarios."""
    records: list[dict[str, Any]] = []

    # Detectar columnas
    grupo_col = None
    total_col = None
    mujer_col = None
    varon_col = None

    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["totales", "grupo", "edad", "rango"]):
            grupo_col = col
        elif "total" in col_lower and "poblaci" in col_lower:
            total_col = col
        elif "mujer" in col_lower or "femenino" in col_lower:
            mujer_col = col
        elif "varon" in col_lower or "masculino" in col_lower:
            varon_col = col

    if not grupo_col or not total_col:
        logger.warning("Columnas no encontradas en censo_agrupado")
        return records

    # Procesar cada grupo etario
    for _, row in df.iterrows():
        grupo = row.get(grupo_col)
        if pd.isna(grupo):
            continue

        grupo_str = str(grupo).strip()

        # Total población del grupo
        total_val = row.get(total_col)
        if pd.notna(total_val):
            try:
                valor = float(total_val)
                records.append({
                    "indicador_nombre": "Población por grupo etario",
                    "categoria": "demografia",
                    "valor": valor,
                    "periodo": "2022",
                    "region": "Córdoba",
                    "desglose": json.dumps({
                        "fuente": filename,
                        "hoja": sheet,
                        "grupo_etario": grupo_str,
                        "sexo": "total",
                    }),
                    "unidad": "hab",
                })
            except (ValueError, TypeError):
                pass

        # Mujeres
        if mujer_col and pd.notna(row.get(mujer_col)):
            try:
                valor = float(row[mujer_col])
                records.append({
                    "indicador_nombre": "Población por grupo etario",
                    "categoria": "demografia",
                    "valor": valor,
                    "periodo": "2022",
                    "region": "Córdoba",
                    "desglose": json.dumps({
                        "fuente": filename,
                        "hoja": sheet,
                        "grupo_etario": grupo_str,
                        "sexo": "femenino",
                    }),
                    "unidad": "hab",
                })
            except (ValueError, TypeError):
                pass

        # Varones
        if varon_col and pd.notna(row.get(varon_col)):
            try:
                valor = float(row[varon_col])
                records.append({
                    "indicador_nombre": "Población por grupo etario",
                    "categoria": "demografia",
                    "valor": valor,
                    "periodo": "2022",
                    "region": "Córdoba",
                    "desglose": json.dumps({
                        "fuente": filename,
                        "hoja": sheet,
                        "grupo_etario": grupo_str,
                        "sexo": "masculino",
                    }),
                    "unidad": "hab",
                })
            except (ValueError, TypeError):
                pass

    return records


def _process_censo_nacional(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Procesa hoja Totales nacion: datos nacionales por grupos etarios."""
    records: list[dict[str, Any]] = []

    # Misma estructura que censo_agrupado pero para Argentina
    grupo_col = None
    total_col = None
    mujer_col = None
    varon_col = None

    for col in df.columns:
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["edad", "totales"]):
            grupo_col = col
        elif "total" in col_lower and "poblaci" in col_lower:
            total_col = col
        elif "mujer" in col_lower or "femenino" in col_lower:
            mujer_col = col
        elif "varon" in col_lower or "masculino" in col_lower:
            varon_col = col

    if not grupo_col or not total_col:
        return records

    for _, row in df.iterrows():
        grupo = row.get(grupo_col)
        if pd.isna(grupo):
            continue

        grupo_str = str(grupo).strip()

        # Total población nacional del grupo
        total_val = row.get(total_col)
        if pd.notna(total_val):
            try:
                valor = float(total_val)
                records.append({
                    "indicador_nombre": "Población por grupo etario",
                    "categoria": "demografia",
                    "valor": valor,
                    "periodo": "2022",
                    "region": "Argentina",
                    "desglose": json.dumps({
                        "fuente": filename,
                        "hoja": sheet,
                        "grupo_etario": grupo_str,
                        "sexo": "total",
                    }),
                    "unidad": "hab",
                })
            except (ValueError, TypeError):
                pass

    return records


def _transform_edad_madre(filepath: Path) -> list[dict[str, Any]]:
    """Transforma datos de nacimientos por edad de la madre."""
    records: list[dict[str, Any]] = []
    sheets = read_excel_file(filepath)

    for sheet_name, df in sheets.items():
        df = clean_column_names(df)
        df = df.dropna(how="all")

        if df.empty or len(df.columns) < 2:
            continue

        logger.info("Procesando Edad_Madre - hoja: %s (%d filas)", sheet_name, len(df))

        # Detectar columnas
        edad_col = df.columns[0]
        nac_col = df.columns[1]

        # Procesar cada tramo de edad
        for _, row in df.iterrows():
            tramo = row.get(edad_col)
            nacimientos = row.get(nac_col)

            if pd.isna(tramo) or pd.isna(nacimientos):
                continue

            try:
                valor = float(nacimientos)
                records.append({
                    "indicador_nombre": "Nacimientos por edad de la madre",
                    "categoria": "demografia",
                    "valor": valor,
                    "periodo": "2022",
                    "region": "Córdoba",
                    "desglose": json.dumps({
                        "fuente": filepath.name,
                        "hoja": sheet_name,
                        "tramo_edad_madre": str(tramo).strip(),
                    }),
                    "unidad": "casos",
                })
            except (ValueError, TypeError):
                continue

    return records


def _transform_nacidos_vivos(filepath: Path) -> list[dict[str, Any]]:
    """Transforma datos de nacidos vivos registrados por año."""
    records: list[dict[str, Any]] = []
    sheets = read_excel_file(filepath)

    for sheet_name, df in sheets.items():
        # Saltar hojas de descripción
        if sheet_name.lower() in ["descripción", "descripci�n", "notas"]:
            continue

        df = clean_column_names(df)
        df = df.dropna(how="all")

        if df.empty:
            continue

        logger.info("Procesando datosDEIS - hoja: %s (%d filas)", sheet_name, len(df))

        # Detectar columnas
        anio_col = None
        cordoba_col = None

        for col in df.columns:
            col_str = str(col).lower()
            if "a�o" in col_str or "anio" in col_str or "año" in col_str:
                anio_col = col
            elif "cordoba" in col_str:
                cordoba_col = col

        if not anio_col or not cordoba_col:
            # Intentar por posición
            anio_col = df.columns[1] if len(df.columns) > 1 else None
            cordoba_col = df.columns[3] if len(df.columns) > 3 else None

        if not anio_col or not cordoba_col:
            logger.warning("Columnas no encontradas en datosDEIS")
            continue

        # Procesar cada año
        for _, row in df.iterrows():
            anio = row.get(anio_col)
            nacidos = row.get(cordoba_col)

            if pd.isna(anio) or pd.isna(nacidos):
                continue

            try:
                anio_str = str(int(anio)) if isinstance(anio, (int, float)) else str(anio)
                valor = float(nacidos)

                records.append({
                    "indicador_nombre": "Nacidos vivos registrados",
                    "categoria": "demografia",
                    "valor": valor,
                    "periodo": anio_str,
                    "region": "Córdoba",
                    "desglose": json.dumps({
                        "fuente": filepath.name,
                        "hoja": sheet_name,
                    }),
                    "unidad": "casos",
                })
            except (ValueError, TypeError):
                continue

    return records
