"""
Transformación de datos de seguridad/justicia.

Este módulo maneja datos de nivel de fila (registros individuales) y los agrega
por año y tipo de materia/categoría para el dashboard.
"""
import json
import logging
from typing import Any

import pandas as pd

from etl.extract import read_excel_file, clean_column_names, find_data_files
from etl.config import DATA_FILES

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

            records.extend(_transform_justicia_rowlevel(df, filepath.name, sheet_name))

    return records


def _transform_justicia_rowlevel(df: pd.DataFrame, filename: str, sheet: str) -> list[dict[str, Any]]:
    """
    Transforma datos de justicia a nivel de fila.

    Los datos tienen estructura: cada fila = 1 denuncia/caso individual.
    Agregamos por año y materia para obtener conteos.
    """
    records: list[dict[str, Any]] = []

    # Las columnas por posición (evitar problemas de encoding en nombres)
    # Col 0: Materia, Col 2: Año, Col 6: Número de registros
    if len(df.columns) < 7:
        logger.warning("DataFrame con pocas columnas en %s, saltando", filename)
        return records

    materia_col = df.columns[0]
    # año_col = df.columns[2]  # Todos los datos son del mismo año
    count_col = df.columns[6]

    # Obtener el año de los datos
    años = df[materia_col].dropna().unique()
    if len(df) > 0:
        # Tomar el año de la primera fila, columna 2
        try:
            año_val = df.iloc[0, 2]
            año_str = str(int(float(año_val))) if pd.notna(año_val) else "2022"
        except (ValueError, TypeError, IndexError):
            año_str = "2022"
    else:
        año_str = "2022"

    # Agregar por materia
    if materia_col and count_col:
        agg = df.groupby(materia_col)[count_col].sum().reset_index()
        agg.columns = ["materia", "total"]

        for _, row in agg.iterrows():
            materia = str(row["materia"]).strip() if pd.notna(row["materia"]) else "Sin especificar"
            total = row["total"]

            if pd.notna(total):
                try:
                    valor = float(total)
                except (ValueError, TypeError):
                    continue

                # Clasificar tipo para DDNA
                tipo = _clasificar_materia(materia)

                records.append({
                    "indicador_nombre": f"Casos de {materia}",
                    "categoria": "seguridad",
                    "valor": valor,
                    "periodo": año_str,
                    "region": "Córdoba",
                    "desglose": json.dumps({
                        "materia": materia,
                        "tipo": tipo,
                        "fuente": filename,
                        "hoja": sheet,
                    }),
                    "unidad": "casos",
                })

    # Total general
    total_general = df[count_col].sum() if count_col in df.columns else len(df)
    records.append({
        "indicador_nombre": "Total casos sistema de justicia",
        "categoria": "seguridad",
        "valor": float(total_general),
        "periodo": año_str,
        "region": "Córdoba",
        "desglose": json.dumps({
            "tipo": "total",
            "fuente": filename,
            "hoja": sheet,
            "materias_incluidas": list(df[materia_col].unique()) if materia_col in df.columns else [],
        }),
        "unidad": "casos",
    })

    return records


def _clasificar_materia(materia: str) -> str:
    """Clasifica la materia según relevancia para DDNA."""
    materia_lower = materia.lower()
    if "violencia" in materia_lower and "familiar" in materia_lower:
        return "violencia_familiar"
    elif "penal" in materia_lower and "juvenil" in materia_lower:
        return "penal_juvenil"
    elif "niñez" in materia_lower or "nineez" in materia_lower.replace("ñ", "n"):
        return "ninez"
    elif "familia" in materia_lower:
        return "familia"
    elif "fiscal" in materia_lower:
        return "fiscalias"
    elif "civil" in materia_lower:
        return "civil"
    else:
        return "otro"