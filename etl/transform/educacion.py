"""
Transformación de datos educativos (Aprender, Censo 2022).
"""
import json
import logging
from typing import Any

import pandas as pd

from etl.extract import read_excel_file, clean_column_names, find_data_files
from etl.config import DATA_FILES

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

        name_lower = filepath.name.lower()

        if "aprender" in str(filepath).lower() or "provincia" in name_lower:
            # Archivo Aprender: múltiples hojas por nivel educativo
            records.extend(_transform_aprender(sheets, filepath.name))
        elif "edades" in name_lower or "edad" in name_lower:
            # Censo 2022: educación por edades
            for sheet_name, df in sheets.items():
                df = clean_column_names(df)
                df = df.dropna(how="all")
                if df.empty:
                    continue
                records.extend(_transform_censo_edades(df, filepath.name, sheet_name))
        elif "nivel" in name_lower:
            # Censo 2022: educación por nivel
            for sheet_name, df in sheets.items():
                df = clean_column_names(df)
                df = df.dropna(how="all")
                if df.empty or "cuadro" not in sheet_name.lower():
                    continue
                records.extend(_transform_censo_nivel(df, filepath.name, sheet_name))

    return records


def _transform_aprender(sheets: dict[str, pd.DataFrame], filename: str) -> list[dict[str, Any]]:
    """Transforma datos del operativo Aprender (por departamento)."""
    records: list[dict[str, Any]] = []
    
    for sheet_name, df in sheets.items():
        df = clean_column_names(df)
        df = df.dropna(how="all")
        if df.empty or "departamento" not in str(df.columns).lower():
            continue

        sheet_lower = sheet_name.lower()
        
        # Detectar el nivel educativo de la hoja
        if "primario" in sheet_lower:
            nivel = "Primario"
        elif "secundario" in sheet_lower:
            nivel = "Secundario"
        else:
            nivel = "General"

        # Encontrar columna de departamento
        depto_col = None
        for col in df.columns:
            if "departamento" in str(col).lower():
                depto_col = col
                break

        if not depto_col:
            continue

        # Procesar cada métrica disponible en la hoja
        for _, row in df.iterrows():
            depto = str(row[depto_col]).strip() if pd.notna(row[depto_col]) else ""
            if not depto or depto.lower() in ["total", "nan", ""]:
                continue

            # Para cada columna numérica, crear un registro
            for col in df.columns:
                if col == depto_col:
                    continue
                
                col_str = str(col).lower().strip()
                valor = row.get(col)
                
                if pd.notna(valor) and pd.api.types.is_number(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue

                    # Determinar el tipo de métrica
                    if "repitente" in col_str:
                        indicador = f"Tasa de repitencia - {nivel}"
                        unidad = "%"
                    elif "sobreedad" in col_str:
                        indicador = f"Tasa de sobreedad - {nivel}"
                        unidad = "%"
                    elif "alumnos" in col_str and "total" in col_str:
                        indicador = f"Matrícula - {nivel}"
                        unidad = "hab"
                    elif "alumnos" in col_str and "estatal" in col_str:
                        indicador = f"Matrícula sector estatal - {nivel}"
                        unidad = "hab"
                    elif "alumnos" in col_str and "privado" in col_str:
                        indicador = f"Matrícula sector privado - {nivel}"
                        unidad = "hab"
                    elif "unidades educativas" in col_str or "escuelas" in col_str:
                        indicador = f"Unidades educativas - {nivel}"
                        unidad = "casos"
                    elif "docente" in col_str:
                        indicador = f"Personal docente - {nivel}"
                        unidad = "hab"
                    else:
                        indicador = f"{col} - {nivel}"
                        unidad = "casos"

                    records.append({
                        "indicador_nombre": indicador,
                        "categoria": "educacion",
                        "valor": valor_float,
                        "periodo": "2024",  # Datos Aprender son del ciclo lectivo actual
                        "region": depto,
                        "desglose": json.dumps({
                            "nivel_educativo": nivel,
                            "sector": "estatal" if "estatal" in col_str else ("privado" if "privado" in col_str else "total"),
                            "fuente": "Operativo Aprender",
                            "archivo": filename,
                            "hoja": sheet_name,
                            "campo_original": str(col),
                        }),
                        "unidad": unidad,
                    })

    return records


def _transform_censo_edades(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transforma datos del Censo 2022: educación por edades."""
    records: list[dict[str, Any]] = []

    # Encontrar columna de edad
    edad_col = None
    for col in df.columns:
        if "edad" in str(col).lower():
            edad_col = col
            break

    if not edad_col:
        logger.warning("No se encontró columna de edad en %s", filename)
        return records

    # Métricas por edad
    metricas = [
        ("Población en viviendas particulares", "hab", "poblacion_total"),
        ("Población que asiste", "hab", "asiste"),
        ("Población que no asiste pero asistió", "hab", "no_asiste_asistio"),
        ("Población que nunca asistió", "hab", "nunca_asistio"),
    ]

    for _, row in df.iterrows():
        edad = row.get(edad_col)
        if pd.isna(edad):
            continue
        
        try:
            edad_val = int(float(edad))
        except (ValueError, TypeError):
            continue

        # Solo procesar edades relevantes para NNA (0-17 años)
        if edad_val > 17:
            continue

        for col_nombre, unidad, clave in metricas:
            col = None
            for c in df.columns:
                if col_nombre.lower() in str(c).lower():
                    col = c
                    break

            if col:
                valor = row.get(col)
                if pd.notna(valor) and pd.api.types.is_number(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue

                    records.append({
                        "indicador_nombre": "Escolarización por edad",
                        "categoria": "educacion",
                        "valor": valor_float,
                        "periodo": "2022",
                        "region": "Córdoba",
                        "desglose": json.dumps({
                            "edad": edad_val,
                            "metrica": clave,
                            "descripcion": col_nombre,
                            "fuente": "Censo Nacional 2022",
                            "archivo": filename,
                            "hoja": sheet,
                        }),
                        "unidad": unidad,
                    })

    # Calcular tasa de asistencia por edad
    for _, row in df.iterrows():
        edad = row.get(edad_col)
        if pd.isna(edad):
            continue
        
        try:
            edad_val = int(float(edad))
        except (ValueError, TypeError):
            continue

        if edad_val > 17:
            continue

        # Buscar columnas de asistencia y población total
        col_asiste = None
        col_total = None
        for c in df.columns:
            c_lower = str(c).lower()
            if "asiste" in c_lower and "no asiste" not in c_lower:
                col_asiste = c
            elif "población" in c_lower and "viviendas" in c_lower:
                col_total = c

        if col_asiste and col_total:
            asiste = row.get(col_asiste)
            total = row.get(col_total)
            if pd.notna(asiste) and pd.notna(total) and total > 0:
                try:
                    tasa = (float(asiste) / float(total)) * 100
                    records.append({
                        "indicador_nombre": "Tasa de asistencia educativa",
                        "categoria": "educacion",
                        "valor": round(tasa, 2),
                        "periodo": "2022",
                        "region": "Córdoba",
                        "desglose": json.dumps({
                            "edad": edad_val,
                            "asistentes": int(float(asiste)),
                            "poblacion_total": int(float(total)),
                            "fuente": "Censo Nacional 2022",
                            "archivo": filename,
                            "hoja": sheet,
                        }),
                        "unidad": "%",
                    })
                except (ValueError, TypeError):
                    continue

    return records


def _transform_censo_nivel(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """Transforma datos del Censo 2022: educación por nivel alcanzado."""
    records: list[dict[str, Any]] = []

    # Encontrar columna de edad
    edad_col = None
    for col in df.columns:
        if "edad" in str(col).lower():
            edad_col = col
            break

    if not edad_col:
        logger.warning("No se encontró columna de edad en %s", filename)
        return records

    # Niveles educativos a procesar
    niveles = [
        ("Sin instrucción", "sin_instruccion"),
        ("Primario Incompleto", "primario_incompleto"),
        ("Primario Completo", "primario_completo"),
        ("Secundario Incompleto", "secundario_incompleto"),
        ("Secundario Completo", "secundario_completo"),
        ("Terciario Incompleto", "terciario_incompleto"),
        ("Terciario Completo", "terciario_completo"),
        ("Universitario Incompleto", "universitario_incompleto"),
        ("Universitario Completo", "universitario_completo"),
    ]

    for _, row in df.iterrows():
        edad = row.get(edad_col)
        if pd.isna(edad):
            continue
        
        try:
            edad_val = int(float(edad))
        except (ValueError, TypeError):
            continue

        # Procesar todas las edades pero destacar rangos de NNA
        for nivel_nombre, nivel_clave in niveles:
            col = None
            for c in df.columns:
                if nivel_nombre.lower() in str(c).lower():
                    col = c
                    break

            if col:
                valor = row.get(col)
                if pd.notna(valor) and pd.api.types.is_number(valor):
                    try:
                        valor_float = float(valor)
                    except (ValueError, TypeError):
                        continue

                    records.append({
                        "indicador_nombre": "Población por nivel educativo alcanzado",
                        "categoria": "educacion",
                        "valor": valor_float,
                        "periodo": "2022",
                        "region": "Córdoba",
                        "desglose": json.dumps({
                            "edad": edad_val,
                            "nivel_educativo": nivel_nombre,
                            "nivel_clave": nivel_clave,
                            "fuente": "Censo Nacional 2022",
                            "archivo": filename,
                            "hoja": sheet,
                        }),
                        "unidad": "hab",
                    })

    # Calcular totales por nivel (sumando todas las edades)
    for nivel_nombre, nivel_clave in niveles:
        col = None
        for c in df.columns:
            if nivel_nombre.lower() in str(c).lower():
                col = c
                break

        if col:
            total = df[col].sum()
            if pd.notna(total) and total > 0:
                records.append({
                    "indicador_nombre": "Total población por nivel educativo",
                    "categoria": "educacion",
                    "valor": float(total),
                    "periodo": "2022",
                    "region": "Córdoba",
                    "desglose": json.dumps({
                        "nivel_educativo": nivel_nombre,
                        "nivel_clave": nivel_clave,
                        "fuente": "Censo Nacional 2022",
                        "archivo": filename,
                        "hoja": sheet,
                        "es_total": True,
                    }),
                    "unidad": "hab",
                })

    return records
